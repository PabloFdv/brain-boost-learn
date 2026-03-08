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

const BADGE_DEFS: Record<string, { name: string; icon: string; description: string }> = {
  first_correct: { name: "Primeiro Acerto", icon: "✅", description: "Acertou a primeira questão" },
  xp_100: { name: "Centurião", icon: "💯", description: "Alcançou 100 XP" },
  xp_500: { name: "Meio Milhar", icon: "⚡", description: "Alcançou 500 XP" },
  xp_1000: { name: "Mil XP", icon: "🔥", description: "Alcançou 1000 XP" },
  xp_5000: { name: "Lenda", icon: "👑", description: "Alcançou 5000 XP" },
  streak_3: { name: "Consistente", icon: "🔥", description: "3 dias seguidos estudando" },
  streak_7: { name: "Dedicado", icon: "🌟", description: "7 dias seguidos estudando" },
  streak_30: { name: "Mestre do Hábito", icon: "💎", description: "30 dias seguidos estudando" },
  battle_won: { name: "Guerreiro", icon: "⚔️", description: "Venceu uma batalha" },
  battle_5: { name: "Gladiador", icon: "🏛️", description: "Venceu 5 batalhas" },
  perfect_sim: { name: "Simulado Perfeito", icon: "🎯", description: "Acertou 100% em um simulado" },
  challenge30_10: { name: "Veloz", icon: "⚡", description: "Acertou 10+ no Desafio 30s" },
  level_5: { name: "Estudante Dedicado", icon: "📚", description: "Alcançou nível 5" },
  level_10: { name: "Mestre da Turma", icon: "🏆", description: "Alcançou nível 10" },
  level_20: { name: "Gênio da Escola", icon: "🧠", description: "Alcançou nível 20" },
  first_battle: { name: "Desafiante", icon: "🥊", description: "Participou da primeira batalha" },
  study_60min: { name: "Hora de Estudo", icon: "⏰", description: "Estudou 60 minutos no total" },
  study_300min: { name: "Maratonista", icon: "🏃", description: "Estudou 5 horas no total" },
  errors_resolved_10: { name: "Aprendiz", icon: "🔄", description: "Resolveu 10 erros" },
  mastery_topic: { name: "Especialista", icon: "⭐", description: "Dominou um tópico (90%+)" },
  daily_chest_3: { name: "Colecionador", icon: "🎁", description: "Abriu 3 baús diários" },
  daily_chest_7: { name: "Sortudo", icon: "🍀", description: "Abriu 7 baús diários" },
};

async function checkAndAwardBadges(sb: any, userKey: string, context?: Record<string, any>) {
  const awarded: string[] = [];
  const { data: existing } = await sb.from("student_badges").select("badge_id").eq("user_key", userKey);
  const has = new Set((existing || []).map((b: any) => b.badge_id));

  async function award(id: string) {
    if (has.has(id)) return;
    const def = BADGE_DEFS[id];
    if (!def) return;
    // Use select to check first, then insert - avoids upsert issues
    const { data: check } = await sb.from("student_badges")
      .select("id").eq("user_key", userKey).eq("badge_id", id).maybeSingle();
    if (check) { has.add(id); return; }
    const { error } = await sb.from("student_badges").insert({
      user_key: userKey, badge_id: id, badge_name: def.name, badge_icon: def.icon, badge_description: def.description
    });
    if (!error) {
      awarded.push(id);
      has.add(id);
    }
  }

  const { data: profile } = await sb.from("student_profiles").select("*").eq("user_key", userKey).maybeSingle();
  if (!profile) return awarded;

  if (profile.xp >= 100) await award("xp_100");
  if (profile.xp >= 500) await award("xp_500");
  if (profile.xp >= 1000) await award("xp_1000");
  if (profile.xp >= 5000) await award("xp_5000");
  if (profile.level >= 5) await award("level_5");
  if (profile.level >= 10) await award("level_10");
  if (profile.level >= 20) await award("level_20");
  if (profile.streak_days >= 3) await award("streak_3");
  if (profile.streak_days >= 7) await award("streak_7");
  if (profile.streak_days >= 30) await award("streak_30");
  if (profile.total_study_minutes >= 60) await award("study_60min");
  if (profile.total_study_minutes >= 300) await award("study_300min");

  if (context?.first_correct) await award("first_correct");
  if (context?.battle_won) await award("battle_won");
  if (context?.first_battle) await award("first_battle");
  if (context?.perfect_sim) await award("perfect_sim");
  if (context?.challenge30_score && context.challenge30_score >= 10) await award("challenge30_10");
  if (context?.chest_count && context.chest_count >= 3) await award("daily_chest_3");
  if (context?.chest_count && context.chest_count >= 7) await award("daily_chest_7");

  const { count: battleWins } = await sb.from("battle_challenges").select("*", { count: "exact", head: true }).eq("winner_key", userKey);
  if (battleWins && battleWins >= 5) await award("battle_5");

  const { count: resolvedCount } = await sb.from("student_errors").select("*", { count: "exact", head: true }).eq("user_key", userKey).eq("resolved", true);
  if (resolvedCount && resolvedCount >= 10) await award("errors_resolved_10");

  const { data: mastered } = await sb.from("student_topic_progress").select("id").eq("user_key", userKey).gte("mastery_percent", 90).limit(1);
  if (mastered && mastered.length > 0) await award("mastery_topic");

  return awarded;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Daily chest XP rewards with rarities
function generateChestReward(): { xp: number; rarity: string; message: string } {
  const roll = Math.random();
  if (roll < 0.05) return { xp: 200, rarity: "legendary", message: "🏆 LENDÁRIO! Você encontrou 200 XP!" };
  if (roll < 0.20) return { xp: 100, rarity: "epic", message: "💜 ÉPICO! 100 XP no baú!" };
  if (roll < 0.45) return { xp: 50, rarity: "rare", message: "💙 RARO! 50 XP de recompensa!" };
  if (roll < 0.75) return { xp: 30, rarity: "uncommon", message: "💚 INCOMUM! 30 XP encontrados!" };
  return { xp: 15, rarity: "common", message: "🤍 15 XP no baú de hoje!" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const sb = getSb();

    switch (action) {
      case "get_or_create_profile": {
        const { user_key, display_name } = params;
        let { data } = await sb.from("student_profiles").select("*").eq("user_key", user_key).maybeSingle();
        if (!data) {
          const { data: newProfile, error } = await sb.from("student_profiles")
            .insert({ user_key, display_name: display_name || "Estudante" })
            .select("*").single();
          if (error) throw error;
          data = newProfile;
        }
        const today = new Date().toISOString().split("T")[0];
        if (data.last_study_date) {
          const lastDate = new Date(data.last_study_date);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);
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
        const newBadges = await checkAndAwardBadges(sb, user_key);
        return json({ profile: data, new_badges: newBadges });
      }

      case "update_profile": {
        const { user_key, display_name, turma } = params;
        const update: any = {};
        if (display_name !== undefined) update.display_name = display_name;
        if (turma !== undefined) update.turma = turma;
        await sb.from("student_profiles").update(update).eq("user_key", user_key);
        const { data } = await sb.from("student_profiles").select("*").eq("user_key", user_key).single();
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
        
        const badgeCtx: any = {};
        if (reason === "challenge_30s" && amount) badgeCtx.challenge30_score = Math.floor((amount - 10) / 15);
        if (reason === "simulado_perfeito") badgeCtx.perfect_sim = true;
        if (reason === "daily_chest") badgeCtx.chest_opened = true;
        const newBadges = await checkAndAwardBadges(sb, user_key, badgeCtx);
        
        return json({ xp: newXp, level: newLevel, leveled_up: leveledUp, xp_added: amount || 10, new_badges: newBadges });
      }

      case "open_daily_chest": {
        const { user_key } = params;
        // Check if chest already opened today using localStorage key (stored server-side via daily_missions or a simple check)
        const today = new Date().toISOString().split("T")[0];
        
        // Use daily_missions to track chest status
        const { data: mission } = await sb.from("daily_missions").select("*").eq("user_key", user_key).eq("mission_date", today).maybeSingle();
        
        // Check if chest_opened flag is set in missions data
        const missionData = mission?.missions as any[];
        const chestOpened = missionData?.some((m: any) => m.type === "chest" && m.current >= m.target);
        
        if (chestOpened) {
          return json({ already_opened: true, message: "Você já abriu o baú hoje! Volte amanhã 🕐" });
        }

        const reward = generateChestReward();
        
        // Add XP
        const { data: profile } = await sb.from("student_profiles").select("xp, level").eq("user_key", user_key).single();
        if (profile) {
          const newXp = profile.xp + reward.xp;
          const newLevel = calculateLevel(newXp);
          await sb.from("student_profiles").update({ xp: newXp, level: newLevel }).eq("user_key", user_key);
        }

        // Mark chest as opened in missions
        if (mission && missionData) {
          const updated = [...missionData, { id: "chest", title: "Baú aberto", target: 1, current: 1, type: "chest", xp: reward.xp }];
          await sb.from("daily_missions").update({ missions: updated }).eq("id", mission.id);
        }

        // Count total chests opened (count missions that have chest type)
        const { data: allMissions } = await sb.from("daily_missions").select("missions").eq("user_key", user_key);
        let chestCount = 0;
        for (const m of (allMissions || [])) {
          if ((m.missions as any[])?.some((mi: any) => mi.type === "chest")) chestCount++;
        }
        
        const newBadges = await checkAndAwardBadges(sb, user_key, { chest_count: chestCount });

        return json({ ...reward, already_opened: false, new_badges: newBadges });
      }

      case "get_notifications": {
        const { user_key } = params;
        const notifications: any[] = [];
        
        // Check streak
        const { data: profile } = await sb.from("student_profiles").select("*").eq("user_key", user_key).maybeSingle();
        if (profile) {
          if (profile.streak_days >= 3) {
            notifications.push({ type: "streak", icon: "🔥", title: `${profile.streak_days} dias seguidos!`, desc: "Continue assim!", priority: 1 });
          }
          if (profile.streak_days === 0) {
            notifications.push({ type: "streak_lost", icon: "💔", title: "Seu streak zerou!", desc: "Estude hoje para recomeçar", priority: 3 });
          }
        }

        // Check daily missions
        const today = new Date().toISOString().split("T")[0];
        const { data: missions } = await sb.from("daily_missions").select("*").eq("user_key", user_key).eq("mission_date", today).maybeSingle();
        if (missions) {
          const mList = missions.missions as any[];
          const pending = mList.filter((m: any) => m.current < m.target && m.type !== "chest").length;
          if (pending > 0) {
            notifications.push({ type: "missions", icon: "🎯", title: `${pending} missão(ões) pendente(s)`, desc: "Complete para ganhar XP!", priority: 2 });
          }
        }

        // Check unresolved errors
        const { count: errorCount } = await sb.from("student_errors").select("*", { count: "exact", head: true }).eq("user_key", user_key).eq("resolved", false);
        if (errorCount && errorCount >= 3) {
          notifications.push({ type: "errors", icon: "⚠️", title: `${errorCount} erros para revisar`, desc: "Vá ao Lab de Erros", priority: 2 });
        }

        // Check new badges
        const { data: recentBadges } = await sb.from("student_badges").select("*").eq("user_key", user_key)
          .gte("earned_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("earned_at", { ascending: false });
        for (const b of (recentBadges || [])) {
          notifications.push({ type: "badge", icon: b.badge_icon, title: `Nova conquista: ${b.badge_name}!`, desc: b.badge_description, priority: 1 });
        }

        // Check chest
        const chestOpened = (missions?.missions as any[])?.some((m: any) => m.type === "chest");
        if (!chestOpened) {
          notifications.push({ type: "chest", icon: "🎁", title: "Baú diário disponível!", desc: "Abra e ganhe XP surpresa", priority: 1 });
        }

        notifications.sort((a, b) => a.priority - b.priority);
        return json({ notifications });
      }

      case "record_answer": {
        const { user_key, grade, subject, topic, correct, response_time_ms, question_text, wrong_answer, correct_answer } = params;
        const { data: existing } = await sb.from("student_topic_progress")
          .select("*").eq("user_key", user_key).eq("grade", grade).eq("subject", subject).eq("topic", topic).maybeSingle();

        if (existing) {
          const newCorrect = existing.correct_count + (correct ? 1 : 0);
          const newWrong = existing.wrong_count + (correct ? 0 : 1);
          const newTotal = existing.total_attempts + 1;
          const mastery = Math.round((newCorrect / newTotal) * 100);
          const avgTime = response_time_ms ? Math.round(((existing.avg_response_time_ms * existing.total_attempts) + response_time_ms) / newTotal) : existing.avg_response_time_ms;
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

        if (!correct && question_text) {
          const { data: existingError } = await sb.from("student_errors")
            .select("*").eq("user_key", user_key).eq("question_text", question_text).maybeSingle();
          if (existingError) {
            await sb.from("student_errors").update({
              error_count: existingError.error_count + 1, last_error_at: new Date().toISOString(), resolved: false
            }).eq("id", existingError.id);
          } else {
            await sb.from("student_errors").insert({ user_key, grade, subject, topic, question_text, wrong_answer, correct_answer });
          }
        }

        if (correct && question_text) {
          await sb.from("student_errors").update({ resolved: true })
            .eq("user_key", user_key).eq("question_text", question_text).eq("resolved", false);
        }

        const xpAmount = correct ? 15 : 5;
        const { data: profile } = await sb.from("student_profiles").select("xp, level").eq("user_key", user_key).single();
        if (profile) {
          const newXp = profile.xp + xpAmount;
          const newLevel = calculateLevel(newXp);
          await sb.from("student_profiles").update({ xp: newXp, level: newLevel }).eq("user_key", user_key);
        }

        const badgeCtx: any = {};
        if (correct) {
          const { count } = await sb.from("student_topic_progress").select("*", { count: "exact", head: true }).eq("user_key", user_key);
          if (count === 1) badgeCtx.first_correct = true;
        }
        const newBadges = await checkAndAwardBadges(sb, user_key, badgeCtx);
        return json({ xp_earned: xpAmount, correct, new_badges: newBadges });
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
        const { turma } = params;
        let query = sb.from("student_profiles").select("user_key, display_name, xp, level, streak_days, turma").order("xp", { ascending: false }).limit(50);
        if (turma) query = query.eq("turma", turma);
        const { data } = await query;
        return json({ ranking: data || [] });
      }

      case "get_daily_missions": {
        const { user_key } = params;
        const today = new Date().toISOString().split("T")[0];
        let { data } = await sb.from("daily_missions").select("*").eq("user_key", user_key).eq("mission_date", today).maybeSingle();
        if (!data) {
          const missions = [
            { id: "m1", title: "Responder 5 exercícios", target: 5, current: 0, type: "exercises", xp: 50 },
            { id: "m2", title: "Estudar por 10 minutos", target: 10, current: 0, type: "study_time", xp: 30 },
            { id: "m3", title: "Acertar 3 seguidas", target: 3, current: 0, type: "streak_correct", xp: 40 },
          ];
          const { data: newMission, error } = await sb.from("daily_missions").insert({
            user_key, mission_date: today, missions, total_count: 3, xp_reward: 120
          }).select("*").single();
          if (error) throw error;
          data = newMission;
        }
        return json({ missions: data });
      }

      case "record_study_session": {
        const { user_key, grade, subject, topic, duration_minutes, session_type } = params;
        await sb.from("study_sessions").insert({ user_key, grade, subject, topic, duration_minutes: duration_minutes || 0, session_type: session_type || "lesson", ended_at: new Date().toISOString() });
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
        const subjectMap: Record<string, { total: number; weighted: number }> = {};
        for (const p of progress) {
          if (!subjectMap[p.subject]) subjectMap[p.subject] = { total: 0, weighted: 0 };
          subjectMap[p.subject].total += p.total_attempts;
          subjectMap[p.subject].weighted += p.mastery_percent * p.total_attempts;
        }
        const predictions = Object.entries(subjectMap).map(([subject, data]) => ({
          subject, predicted_grade: Math.round((data.weighted / data.total) / 10)
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
        const topicCount: Record<string, number> = {};
        for (const report of data) {
          const topics = report.topics_appeared as string[];
          for (const t of topics) { topicCount[t] = (topicCount[t] || 0) + 1; }
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

      case "get_badges": {
        const { user_key } = params;
        const { data } = await sb.from("student_badges").select("*").eq("user_key", user_key).order("earned_at", { ascending: false });
        return json({ badges: data || [] });
      }

      case "create_battle": {
        const { challenger_key, challenger_name, subject, questions } = params;
        const { data, error } = await sb.from("battle_challenges").insert({
          challenger_key, challenger_name, subject, questions, status: "pending"
        }).select("*").single();
        if (error) throw error;
        await checkAndAwardBadges(sb, challenger_key, { first_battle: true });
        return json({ battle: data });
      }

      case "get_battles": {
        const { user_key } = params;
        const { data } = await sb.from("battle_challenges").select("*")
          .or(`challenger_key.eq.${user_key},opponent_key.eq.${user_key},status.eq.pending`)
          .order("created_at", { ascending: false }).limit(20);
        return json({ battles: data || [] });
      }

      case "delete_battle": {
        const { battle_id, user_key } = params;
        const { data: battle } = await sb.from("battle_challenges").select("*").eq("id", battle_id).single();
        if (!battle) return json({ error: "Battle not found" }, 404);
        if (battle.challenger_key !== user_key && battle.status !== "completed") {
          return json({ error: "Cannot delete this battle" }, 403);
        }
        await sb.from("battle_challenges").delete().eq("id", battle_id);
        return json({ deleted: true });
      }

      case "join_battle": {
        const { battle_id, opponent_key, opponent_name } = params;
        await sb.from("battle_challenges").update({ opponent_key, opponent_name, status: "active" }).eq("id", battle_id);
        const { data } = await sb.from("battle_challenges").select("*").eq("id", battle_id).single();
        await checkAndAwardBadges(sb, opponent_key, { first_battle: true });
        return json({ battle: data });
      }

      case "submit_battle_score": {
        const { battle_id, user_key, score } = params;
        const { data: battle } = await sb.from("battle_challenges").select("*").eq("id", battle_id).single();
        if (!battle) return json({ error: "Battle not found" }, 404);
        const isChallenger = battle.challenger_key === user_key;
        const update: any = isChallenger ? { challenger_score: score } : { opponent_score: score };
        const otherScore = isChallenger ? battle.opponent_score : battle.challenger_score;
        const otherSubmitted = isChallenger ? (battle.opponent_key && battle.opponent_score > 0) : battle.challenger_score > 0;
        
        if (otherSubmitted) {
          update.status = "completed";
          update.winner_key = score > otherScore ? user_key : (otherScore > score ? (isChallenger ? battle.opponent_key : battle.challenger_key) : "draw");
        }
        await sb.from("battle_challenges").update(update).eq("id", battle_id);

        const xpAmount = score * 10 + 20;
        const { data: profile } = await sb.from("student_profiles").select("xp, level").eq("user_key", user_key).single();
        if (profile) {
          const newXp = profile.xp + xpAmount;
          const newLevel = calculateLevel(newXp);
          await sb.from("student_profiles").update({ xp: newXp, level: newLevel }).eq("user_key", user_key);
        }

        const badgeCtx: any = {};
        if (update.winner_key === user_key) badgeCtx.battle_won = true;
        const newBadges = await checkAndAwardBadges(sb, user_key, badgeCtx);
        return json({ updated: true, xp_earned: xpAmount, new_badges: newBadges });
      }

      case "get_study_history": {
        const { user_key } = params;
        const { data } = await sb.from("study_sessions").select("*").eq("user_key", user_key).order("started_at", { ascending: false }).limit(30);
        return json({ sessions: data || [] });
      }

      case "get_all_students": {
        const { data } = await sb.from("student_profiles").select("*").order("xp", { ascending: false });
        return json({ students: data || [] });
      }

      case "get_students_by_turma": {
        const { turma } = params;
        const { data } = await sb.from("student_profiles").select("*").eq("turma", turma).order("xp", { ascending: false });
        return json({ students: data || [] });
      }

      case "get_turma_stats": {
        const { turma } = params;
        const { data: students } = await sb.from("student_profiles").select("*").eq("turma", turma);
        if (!students || students.length === 0) return json({ stats: null });
        const avgXp = Math.round(students.reduce((s: number, st: any) => s + st.xp, 0) / students.length);
        const avgLevel = Math.round(students.reduce((s: number, st: any) => s + st.level, 0) / students.length);
        const totalMinutes = students.reduce((s: number, st: any) => s + st.total_study_minutes, 0);
        const activeStudents = students.filter((s: any) => s.last_study_date).length;
        return json({ stats: { total_students: students.length, avg_xp: avgXp, avg_level: avgLevel, total_minutes: totalMinutes, active_students: activeStudents } });
      }

      case "get_student_detail": {
        const { user_key } = params;
        const { data: profile } = await sb.from("student_profiles").select("*").eq("user_key", user_key).single();
        const { data: progress } = await sb.from("student_topic_progress").select("*").eq("user_key", user_key);
        const { data: errors } = await sb.from("student_errors").select("*").eq("user_key", user_key).eq("resolved", false);
        const { data: sessions } = await sb.from("study_sessions").select("*").eq("user_key", user_key).order("started_at", { ascending: false }).limit(10);
        const { data: badges } = await sb.from("student_badges").select("*").eq("user_key", user_key);
        return json({ profile, progress: progress || [], errors: errors || [], sessions: sessions || [], badges: badges || [] });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("gamification error:", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500);
  }
});
