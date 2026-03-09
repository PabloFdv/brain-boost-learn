import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useProfile, useUserKey, callGamification } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, Trophy, Star, Sparkles } from "lucide-react";

export default function WeeklyGoalsPage() {
  const userKey = useUserKey();
  const { profile } = useProfile();
  const [schoolMissions, setSchoolMissions] = useState<any[]>([]);

  useEffect(() => {
    callGamification("get_school_missions").then(r => setSchoolMissions(r.missions || [])).catch(console.error);
  }, []);

  // Weekly goals based on profile
  const weeklyGoals = [
    { title: "Resolver 50 exercícios", target: 50, current: Math.min(50, (profile?.xp || 0) / 15), icon: Target },
    { title: "Estudar 60 minutos", target: 60, current: profile?.total_study_minutes || 0, icon: Flame },
    { title: "Manter sequência de 7 dias", target: 7, current: profile?.streak_days || 0, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-green-500" />
            Metas & Missões
          </h1>
          <p className="text-muted-foreground mt-1">Acompanhe seu progresso semanal e missões da escola</p>
        </motion.div>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Metas Semanais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyGoals.map((g, i) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              const done = pct >= 100;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center gap-3 mb-1">
                    <g.icon className={`h-5 w-5 ${done ? "text-green-500" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium flex-1 ${done ? "text-green-600 line-through" : ""}`}>{g.title}</span>
                    <Badge variant={done ? "default" : "outline"}>{Math.floor(g.current)}/{g.target}</Badge>
                  </div>
                  <Progress value={pct} className="h-3" />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* School Missions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Missões da Escola
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schoolMissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma missão ativa no momento</p>
            ) : schoolMissions.map((m, i) => {
              const pct = Math.min(100, Math.round((m.current_count / m.target_count) * 100));
              return (
                <div key={i} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{m.title}</h4>
                      {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
                    </div>
                    <Badge variant="secondary">+{m.reward_xp} XP</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="flex-1 h-3" />
                    <span className="text-sm text-muted-foreground">{m.current_count}/{m.target_count}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Até {new Date(m.end_date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
