import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSb() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

function xpForLevel(level: number): number {
  return level * 100 + (level - 1) * 50;
}

function calculateLevel(xp: number): number {
  let level = 1;
  let totalNeeded = 0;
  while (true) {
    totalNeeded += xpForLevel(level);
    if (xp < totalNeeded) return level;
    level++;
    if (level > 100) return 100;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const sb = getSb();

    switch (action) {
      case "get_or_create_profile": {
        const { user_key, display_name } = params;
        // Try to get existing
        let { data } = await sb.from("student_profiles").select("*").eq("user_key", user_key).maybeSingle();
        if (!data) {
          const { data: newProfile, error } = await sb.from("student_profiles")
            .insert({ user_key, display_name: display_name || "Estudante" })
            .select("*").single();
          if (error) throw error;
          data = newProfile;
        }
        // Update streak
        const today = new Date().toISOString().split("T")[0];
        if (data.last_study_date) {
          const lastDate = new Date(data.last_study_date);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (86400000));
          if (diffDays === 1) {
            await sb.from("student_profiles").update({ streak_days: data.streak_days + 1, last_study_date: today }).eq("user_key", user_key);
            data.streak_days += 1;
            data.last_study_date = today;
          } else if (diffDays > 1) {
            await sb.from("student_profiles").update({ streak_days: 1, last_study_date: today }).eq("user_key", user_key);
            data.streak_days = 1;
            data.last_study_date = today;
          }
        } else {
          await sb.from("student_profiles").update({ streak_days: 1, last_study_date: today }).eq("user_key", user_key);
          data.streak_days = 1;
          data.last_study_date = today;
        }
        return json({ profile: data });
      }

      case "add_xp": {
        const { user_key, amount, reason } = params;
        const { data: profile } = await sb.from("student_profiles").select("*").eq("user_key", user_key).single();
        if (!profile) return json({ error: "Profile not found" }, 404);
        const newXp = profile.xp + (amount || 10);
        const newLevel = calculateLevel(newXp);
        const leveledUp = newLevel > profile.level;
        await sb.from("student_profiles").update({ xp: newXp, level: newLevel }).eq("user_key", user_key);
        // Update school mission progress
        await sb.from("school_missions").update({ current_count: profile.xp }).eq("active", true).gte("end_date", new Date().toISOString().split("T")[0]);
        return json({ xp: newXp, level: newLevel, leveled_up: leveledUp, xp_added: amount || 10 });
      }

      case "record_answer": {
        const { user_key, grade, subject, topic, correct, response_time_ms, question_text, wrong_answer, correct_answer } = params;
        // Upsert topic progress
        const { data: existing } = await sb.from("student_topic_progress")
          .select("*").eq("user_key", user_key).eq("grade", grade).eq("subject", subject).eq("topic", topic).maybeSingle();

        if (existing) {
          const newCorrect = existing.correct_count + (correct ? 1 : 0);
          const newWrong = existing.wrong_count + (correct ? 0 : 1);
          const newTotal = existing.total_attempts + 1;
          const mastery = Math.round((newCorrect / newTotal) * 100);
          const avgTime = Math.round(((existing.avg_response_time_ms * existing.total_attempts) + (response_time_ms || 0)) / newTotal);
          await sb.from("student_topic_progress").update({
            correct_count: newCorrect, wrong_count: newWrong, total_attempts: newTotal,
            mastery_percent: mastery, avg_response_time_ms: avgTime, last_practiced_at: new Date().toISOString()
          }).eq("id", existing.id);
        } else {
          await sb.from("student_topic_progress").insert({
            user_key, grade, subject, topic,
            correct_count: correct ? 1 : 0, wrong_count: correct ? 0 : 1, total_attempts: 1,
            mastery_percent: correct ? 100 : 0, avg_response_time_ms: response_time_ms || 0,
            last_practiced_at: new Date().toISOString()
          });
        }

        // Record error if wrong
        if (!correct && question_text) {
          const { data: existingError } = await sb.from("student_errors")
            .select("*").eq("user_key", user_key).eq("question_text", question_text).maybeSingle();
          if (existingError) {
            await sb.from("student_errors").update({
              error_count: existingError.error_count + 1, last_error_at: new Date().toISOString(), resolved: false
            }).eq("id", existingError.id);
          } else {
            await sb.from("student_errors").insert({
              user_key, grade, subject, topic, question_text, wrong_answer, correct_answer
            });
          }
        }

        // Add XP
        const xpAmount = correct ? 15 : 5; // even wrong answers give some XP for trying
        const { data: profile } = await sb.from("student_profiles").select("xp, level").eq("user_key", user_key).single();
        if (profile) {
          const newXp = profile.xp + xpAmount;
          const newLevel = calculateLevel(newXp);
          await sb.from("student_profiles").update({ xp: newXp, level: newLevel }).eq("user_key", user_key);
        }

        return json({ xp_earned: xpAmount, correct });
      }

      case "get_brain_map": {
        const { user_key } = params;
        const { data } = await sb.from("student_topic_progress").select("*").eq("user_key", user_key).order("last_practiced_at", { ascending: false });
        return json({ topics: data || [] });
      }

      case "get_errors": {
        const { user_key } = params;
        const { data } = await sb.from("student_errors").select("*").eq("user_key", user_key).eq("resolved", false).order("error_count", { ascending: false }).limit(50);
        return json({ errors: data || [] });
      }

      case "get_ranking": {
        const { data } = await sb.from("student_profiles").select("display_name, xp, level, streak_days").order("xp", { ascending: false }).limit(50);
        return json({ ranking: data || [] });
      }

      case "get_daily_missions": {
        const { user_key } = params;
        const today = new Date().toISOString().split("T")[0];
        let { data } = await sb.from("daily_missions").select("*").eq("user_key", user_key).eq("mission_date", today).maybeSingle();
        if (!data) {
          // Generate missions
          const missions = [
            { id: "m1", title: "Responder 5 exercícios", target: 5, current: 0, type: "exercises", xp: 50 },
            { id: "m2", title: "Estudar por 10 minutos", target: 10, current: 0, type: "study_time", xp: 30 },
            { id: "m3", title: "Acertar 3 questões seguidas", target: 3, current: 0, type: "streak_correct", xp: 40 },
          ];
          const { data: newMission, error } = await sb.from("daily_missions").insert({
            user_key, mission_date: today, missions, total_count: 3, xp_reward: 120
          }).select("*").single();
          if (error) throw error;
          data = newMission;
        }
        return json({ missions: data });
      }

      case "complete_mission": {
        const { user_key, mission_id } = params;
        const today = new Date().toISOString().split("T")[0];
        const { data } = await sb.from("daily_missions").select("*").eq("user_key", user_key).eq("mission_date", today).single();
        if (!data) return json({ error: "No missions today" }, 404);
        const missions = (data.missions as any[]).map((m: any) => m.id === mission_id ? { ...m, current: m.target } : m);
        const completedCount = missions.filter((m: any) => m.current >= m.target).length;
        await sb.from("daily_missions").update({ missions, completed_count: completedCount }).eq("id", data.id);
        return json({ missions, completed_count: completedCount });
      }

      case "record_study_session": {
        const { user_key, grade, subject, topic, duration_minutes, session_type } = params;
        await sb.from("study_sessions").insert({ user_key, grade, subject, topic, duration_minutes: duration_minutes || 0, session_type: session_type || "lesson", ended_at: new Date().toISOString() });
        // Update total study time
        await sb.rpc("", {}).catch(() => {}); // fallback
        const { data: profile } = await sb.from("student_profiles").select("total_study_minutes").eq("user_key", user_key).single();
        if (profile) {
          await sb.from("student_profiles").update({ total_study_minutes: profile.total_study_minutes + (duration_minutes || 0) }).eq("user_key", user_key);
        }
        return json({ recorded: true });
      }

      case "get_grade_prediction": {
        const { user_key } = params;
        const { data: progress } = await sb.from("student_topic_progress").select("*").eq("user_key", user_key);
        if (!progress || progress.length === 0) return json({ predictions: [] });
        // Group by subject and calculate weighted average
        const subjectMap: Record<string, { total: number; weighted: number }> = {};
        for (const p of progress) {
          if (!subjectMap[p.subject]) subjectMap[p.subject] = { total: 0, weighted: 0 };
          subjectMap[p.subject].total += p.total_attempts;
          subjectMap[p.subject].weighted += p.mastery_percent * p.total_attempts;
        }
        const predictions = Object.entries(subjectMap).map(([subject, data]) => ({
          subject,
          predicted_grade: Math.round((data.weighted / data.total) / 10) / 1 // 0-10 scale
        }));
        return json({ predictions });
      }

      case "report_exam": {
        const { user_key, grade, subject, topics_appeared, difficulty, notes } = params;
        await sb.from("exam_reports").insert({ user_key, grade, subject, topics_appeared, difficulty, notes });
        return json({ reported: true });
      }

      case "get_exam_radar": {
        const { grade, subject } = params;
        const { data } = await sb.from("exam_reports").select("topics_appeared").eq("grade", grade).eq("subject", subject);
        if (!data || data.length === 0) return json({ radar: [] });
        // Count topic frequency
        const topicCount: Record<string, number> = {};
        for (const report of data) {
          const topics = report.topics_appeared as string[];
          for (const t of topics) {
            topicCount[t] = (topicCount[t] || 0) + 1;
          }
        }
        const total = data.length;
        const radar = Object.entries(topicCount).map(([topic, count]) => ({
          topic, probability: Math.round((count / total) * 100)
        })).sort((a, b) => b.probability - a.probability);
        return json({ radar });
      }

      case "get_class_brain": {
        const { grade, subject } = params;
        const { data } = await sb.from("student_topic_progress").select("topic, correct_count, wrong_count, total_attempts")
          .eq("grade", grade).eq("subject", subject);
        if (!data || data.length === 0) return json({ topics: [] });
        const topicMap: Record<string, { wrong: number; total: number }> = {};
        for (const d of data) {
          if (!topicMap[d.topic]) topicMap[d.topic] = { wrong: 0, total: 0 };
          topicMap[d.topic].wrong += d.wrong_count;
          topicMap[d.topic].total += d.total_attempts;
        }
        const topics = Object.entries(topicMap).map(([topic, d]) => ({
          topic, error_rate: d.total > 0 ? Math.round((d.wrong / d.total) * 100) : 0
        })).sort((a, b) => b.error_rate - a.error_rate);
        return json({ topics });
      }

      case "get_school_missions": {
        const { data } = await sb.from("school_missions").select("*").eq("active", true).order("end_date", { ascending: true });
        return json({ missions: data || [] });
      }

      case "create_battle": {
        const { challenger_key, challenger_name, subject, questions } = params;
        const { data, error } = await sb.from("battle_challenges").insert({
          challenger_key, challenger_name, subject, questions, status: "pending"
        }).select("*").single();
        if (error) throw error;
        return json({ battle: data });
      }

      case "get_battles": {
        const { user_key } = params;
        const { data } = await sb.from("battle_challenges").select("*")
          .or(`challenger_key.eq.${user_key},opponent_key.eq.${user_key},status.eq.pending`)
          .order("created_at", { ascending: false }).limit(20);
        return json({ battles: data || [] });
      }

      case "join_battle": {
        const { battle_id, opponent_key, opponent_name } = params;
        await sb.from("battle_challenges").update({ opponent_key, opponent_name, status: "active" }).eq("id", battle_id);
        const { data } = await sb.from("battle_challenges").select("*").eq("id", battle_id).single();
        return json({ battle: data });
      }

      case "submit_battle_score": {
        const { battle_id, user_key, score } = params;
        const { data: battle } = await sb.from("battle_challenges").select("*").eq("id", battle_id).single();
        if (!battle) return json({ error: "Battle not found" }, 404);
        const isChallenger = battle.challenger_key === user_key;
        const update: any = isChallenger ? { challenger_score: score } : { opponent_score: score };
        // Check if both have submitted
        const otherScore = isChallenger ? battle.opponent_score : battle.challenger_score;
        if (otherScore > 0 || battle.status === "active") {
          const myScore = score;
          if (otherScore > 0) {
            update.status = "completed";
            update.winner_key = myScore > otherScore ? user_key : (otherScore > myScore ? (isChallenger ? battle.opponent_key : battle.challenger_key) : "draw");
          }
        }
        await sb.from("battle_challenges").update(update).eq("id", battle_id);
        return json({ updated: true });
      }

      case "get_study_history": {
        const { user_key } = params;
        const { data } = await sb.from("study_sessions").select("*").eq("user_key", user_key).order("started_at", { ascending: false }).limit(30);
        return json({ sessions: data || [] });
      }

      case "update_profile_name": {
        const { user_key, display_name } = params;
        await sb.from("student_profiles").update({ display_name }).eq("user_key", user_key);
        return json({ updated: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("gamification error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
