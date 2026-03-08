import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { useProfile, useBrainMap, useDailyMissions, useErrors, useBadges, useUserKey, useNotifications, getGradePrediction, updateProfile, openDailyChest, BadgeData } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Trophy, Brain, Target, Zap, BookOpen, Swords, Timer, TrendingUp, AlertTriangle, Sparkles, GraduationCap, Pencil, Check, X, Users, School, Award, Bell, Gift, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TURMAS, ALL_SUBJECTS } from "@/lib/constants";

const LEVEL_NAMES: Record<number, string> = {
  1: "Iniciante", 2: "Aprendiz", 3: "Aprendiz", 4: "Aprendiz", 5: "Estudante",
  6: "Estudante", 7: "Estudante", 8: "Estudante", 9: "Estudante", 10: "Mestre da Turma",
  15: "Especialista", 20: "Gênio da Escola", 25: "Lenda", 30: "Imortal"
};

function getLevelName(level: number): string {
  const keys = Object.keys(LEVEL_NAMES).map(Number).sort((a, b) => b - a);
  for (const k of keys) { if (level >= k) return LEVEL_NAMES[k]; }
  return "Iniciante";
}

function xpForLevel(level: number): number { return level * 100 + (level - 1) * 50; }
function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

const RARITY_COLORS: Record<string, string> = {
  legendary: "from-yellow-400 to-amber-600",
  epic: "from-purple-500 to-violet-600",
  rare: "from-blue-400 to-cyan-500",
  uncommon: "from-green-400 to-emerald-500",
  common: "from-gray-300 to-gray-400",
};

export default function StudentDashboard() {
  const { profile, loading: profileLoading, refresh, setProfile } = useProfile();
  const { topics: brainTopics, loading: brainLoading } = useBrainMap();
  const { missions, loading: missionsLoading } = useDailyMissions();
  const { errors, loading: errorsLoading } = useErrors();
  const { badges, loading: badgesLoading } = useBadges();
  const { notifications, refresh: refreshNotifs } = useNotifications();
  const userKey = useUserKey();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingTurma, setEditingTurma] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  // Chest state
  const [chestOpen, setChestOpen] = useState(false);
  const [chestResult, setChestResult] = useState<any>(null);
  const [chestLoading, setChestLoading] = useState(false);
  const [chestAnimation, setChestAnimation] = useState(false);

  useEffect(() => {
    if (userKey) {
      getGradePrediction(userKey).then(r => setPredictions(r.predictions || [])).catch(console.error);
    }
  }, [userKey]);

  const handleSaveName = async () => {
    if (!userKey || !newName.trim()) return;
    try {
      const res = await updateProfile(userKey, { display_name: newName.trim() });
      setProfile(res.profile);
      setEditingName(false);
      toast({ title: "Nome atualizado! ✅" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleSaveTurma = async (turma: string) => {
    if (!userKey) return;
    try {
      const res = await updateProfile(userKey, { turma });
      setProfile(res.profile);
      setEditingTurma(false);
      toast({ title: "Turma atualizada! ✅" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleOpenChest = async () => {
    if (!userKey || chestLoading) return;
    setChestLoading(true);
    setChestAnimation(true);
    try {
      // Animate for 1.5s
      await new Promise(r => setTimeout(r, 1500));
      const res = await openDailyChest(userKey);
      setChestResult(res);
      if (!res.already_opened) {
        refresh(); // refresh profile XP
        refreshNotifs();
        toast({ title: res.message || `+${res.xp} XP do baú!` });
      }
    } catch (e) {
      toast({ title: "Erro ao abrir baú", variant: "destructive" });
    } finally {
      setChestLoading(false);
      setChestAnimation(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  const xpInCurrentLevel = profile ? profile.xp - totalXpForLevel(profile.level) : 0;
  const xpNeeded = profile ? xpForLevel(profile.level) : 100;
  const xpProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  const missionsList = missions?.missions || [];
  const completedMissions = (missionsList as any[]).filter((m: any) => m.current >= m.target).length;

  const strongTopics = brainTopics.filter(t => t.mastery_percent >= 80);
  const hasChestNotif = notifications.some(n => n.type === "chest");
  const unreadNotifs = notifications.length;

  const ALL_BADGES = [
    { id: "first_correct", name: "Primeiro Acerto", icon: "✅", desc: "Acertar a primeira questão" },
    { id: "xp_100", name: "Centurião", icon: "💯", desc: "Alcançar 100 XP" },
    { id: "xp_500", name: "Meio Milhar", icon: "⚡", desc: "Alcançar 500 XP" },
    { id: "xp_1000", name: "Mil XP", icon: "🔥", desc: "Alcançar 1000 XP" },
    { id: "xp_5000", name: "Lenda", icon: "👑", desc: "Alcançar 5000 XP" },
    { id: "streak_3", name: "Consistente", icon: "🔥", desc: "3 dias seguidos" },
    { id: "streak_7", name: "Dedicado", icon: "🌟", desc: "7 dias seguidos" },
    { id: "streak_30", name: "Mestre do Hábito", icon: "💎", desc: "30 dias seguidos" },
    { id: "battle_won", name: "Guerreiro", icon: "⚔️", desc: "Vencer uma batalha" },
    { id: "battle_5", name: "Gladiador", icon: "🏛️", desc: "Vencer 5 batalhas" },
    { id: "perfect_sim", name: "Simulado Perfeito", icon: "🎯", desc: "100% num simulado" },
    { id: "challenge30_10", name: "Veloz", icon: "⚡", desc: "10+ no Desafio 30s" },
    { id: "level_5", name: "Estudante Dedicado", icon: "📚", desc: "Alcançar nível 5" },
    { id: "level_10", name: "Mestre da Turma", icon: "🏆", desc: "Alcançar nível 10" },
    { id: "level_20", name: "Gênio da Escola", icon: "🧠", desc: "Alcançar nível 20" },
    { id: "first_battle", name: "Desafiante", icon: "🥊", desc: "Primeira batalha" },
    { id: "study_60min", name: "Hora de Estudo", icon: "⏰", desc: "60 min estudados" },
    { id: "study_300min", name: "Maratonista", icon: "🏃", desc: "5 horas estudadas" },
    { id: "errors_resolved_10", name: "Aprendiz", icon: "🔄", desc: "Resolver 10 erros" },
    { id: "mastery_topic", name: "Especialista", icon: "⭐", desc: "Dominar tópico (90%+)" },
    { id: "daily_chest_3", name: "Colecionador", icon: "🎁", desc: "Abrir 3 baús" },
    { id: "daily_chest_7", name: "Sortudo", icon: "🍀", desc: "Abrir 7 baús" },
  ];

  const earnedIds = new Set(badges.map(b => b.badge_id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-5xl">
        {/* Profile Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl sm:text-2xl font-bold shrink-0">
                    {profile?.display_name?.[0] || "E"}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <Input value={newName} onChange={e => setNewName(e.target.value)} className="h-8 max-w-48"
                          placeholder="Seu nome" autoFocus onKeyDown={e => e.key === "Enter" && handleSaveName()} />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingName(false)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-2xl font-bold truncate">{profile?.display_name}</h1>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setEditingName(true); setNewName(profile?.display_name || ""); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                        <GraduationCap className="h-3 w-3" />
                        Nv. {profile?.level} — {getLevelName(profile?.level || 1)}
                      </Badge>
                      {(profile?.streak_days || 0) > 0 && (
                        <Badge variant="destructive" className="gap-1 animate-pulse text-[10px] sm:text-xs">
                          <Flame className="h-3 w-3" />
                          {profile?.streak_days} 🔥
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {editingTurma ? (
                        <div className="flex items-center gap-1">
                          <Select value={profile?.turma || ""} onValueChange={handleSaveTurma}>
                            <SelectTrigger className="h-7 text-[10px] sm:text-xs max-w-56"><SelectValue placeholder="Selecionar turma" /></SelectTrigger>
                            <SelectContent>
                              {TURMAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingTurma(false)}><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingTurma(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate">
                          {profile?.turma || "📝 Selecionar turma"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto justify-between">
                  <div className="text-right">
                    <div className="text-xl sm:text-3xl font-bold text-primary">{profile?.xp?.toLocaleString()} XP</div>
                    <div className="text-[10px] sm:text-sm text-muted-foreground">{profile?.total_study_minutes || 0} min estudados</div>
                  </div>
                  {/* Notification bell */}
                  <Button size="icon" variant="ghost" className="h-9 w-9 relative" onClick={() => setShowNotifs(!showNotifs)}>
                    <Bell className="h-5 w-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
                        {unreadNotifs}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span>Progresso para nível {(profile?.level || 1) + 1}</span>
                  <span>{xpInCurrentLevel}/{xpNeeded} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2.5 sm:h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Panel Overlay */}
        <AnimatePresence>
          {showNotifs && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowNotifs(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-14 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-50 bg-card border border-border rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto"
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold">Notificações</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowNotifs(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">Tudo em dia! ✅</div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n, i) => (
                      <div key={i} className="p-3 flex items-start gap-2.5 hover:bg-muted/50 transition-colors">
                        <span className="text-lg shrink-0">{n.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{n.title}</div>
                          <div className="text-xs text-muted-foreground">{n.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <Card className={`border-2 transition-all ${hasChestNotif ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-amber-500/5" : "border-border"}`}>
            <CardContent className="p-4 sm:p-5">
              {chestResult && !chestResult.already_opened ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-2"
                >
                  <div className={`inline-block rounded-2xl px-6 py-3 bg-gradient-to-r ${RARITY_COLORS[chestResult.rarity] || RARITY_COLORS.common}`}>
                    <div className="text-3xl sm:text-4xl mb-1">✨</div>
                    <div className="text-white font-bold text-lg sm:text-xl">+{chestResult.xp} XP</div>
                    <div className="text-white/80 text-xs sm:text-sm capitalize">{chestResult.rarity}</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{chestResult.message}</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setChestResult(null)}>Fechar</Button>
                </motion.div>
              ) : chestResult?.already_opened ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl grayscale opacity-50">🎁</span>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Baú já aberto hoje</div>
                    <div className="text-xs text-muted-foreground">Volte amanhã para mais recompensas!</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.span
                      animate={chestAnimation ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: chestAnimation ? Infinity : 0 }}
                      className="text-3xl sm:text-4xl cursor-pointer"
                    >
                      🎁
                    </motion.span>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold">Baú Diário</div>
                      <div className="text-xs text-muted-foreground">Abra e ganhe XP surpresa!</div>
                    </div>
                  </div>
                  <Button
                    onClick={handleOpenChest}
                    disabled={chestLoading}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shrink-0 shadow-lg"
                  >
                    <Gift className="h-4 w-4 mr-1.5" />
                    {chestLoading ? "Abrindo..." : "Abrir Baú"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {[
            { icon: Zap, label: "Desafio 30s", href: "/challenge30", color: "text-yellow-500" },
            { icon: Swords, label: "Batalha", href: "/battle", color: "text-red-500" },
            { icon: Target, label: "Simulado", href: "/simulator", color: "text-blue-500" },
            { icon: AlertTriangle, label: "Provas", href: "/exam-alert", color: "text-orange-500" },
            { icon: Brain, label: "Lab Mental", href: "/mental-lab", color: "text-pink-500" },
            { icon: BookOpen, label: "Aulas", href: "/", color: "text-green-500" },
          ].map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={action.href}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer group h-full">
                  <CardContent className="p-2.5 sm:p-3 flex flex-col items-center gap-0.5 sm:gap-1 text-center">
                    <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-yellow-500/20">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Conquistas
                  <Badge variant="outline" className="ml-auto text-[10px] sm:text-xs">{badges.length}/{ALL_BADGES.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {(showAllBadges ? ALL_BADGES : ALL_BADGES.slice(0, 10)).map(b => {
                    const earned = earnedIds.has(b.id);
                    return (
                      <motion.div
                        key={b.id}
                        whileHover={{ scale: 1.1 }}
                        className={`flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg text-center cursor-default transition-all ${earned ? "bg-yellow-500/10 ring-1 ring-yellow-500/20" : "bg-muted/30 opacity-40 grayscale"}`}
                        title={`${b.name}: ${b.desc}`}
                      >
                        <span className="text-xl sm:text-2xl">{b.icon}</span>
                        <span className="text-[8px] sm:text-[9px] font-medium leading-tight">{b.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
                {ALL_BADGES.length > 10 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setShowAllBadges(!showAllBadges)}>
                    {showAllBadges ? "Mostrar menos" : `Ver todas (${ALL_BADGES.length})`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Missions */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Missões do Dia
                  <Badge variant="outline" className="ml-auto text-[10px] sm:text-xs">{completedMissions}/{(missionsList as any[]).filter((m: any) => m.type !== "chest").length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-3">
                {missionsLoading ? (
                  <div className="text-muted-foreground text-sm">Carregando...</div>
                ) : (missionsList as any[]).filter((m: any) => m.type !== "chest").map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 ${m.current >= m.target ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      {m.current >= m.target ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate">{m.title}</div>
                      <Progress value={Math.min(100, (m.current / m.target) * 100)} className="h-1.5 mt-1" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">+{m.xp} XP</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Brain Map */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Mapa do Cérebro
                </CardTitle>
              </CardHeader>
              <CardContent>
                {brainLoading ? (
                  <div className="text-muted-foreground text-sm">Carregando...</div>
                ) : brainTopics.length === 0 ? (
                  <div className="text-muted-foreground text-sm text-center py-4">
                    Comece a estudar para ativar seu mapa cerebral! 🧠
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {brainTopics.slice(0, 10).map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">
                          {t.mastery_percent >= 70 ? "🟢" : t.mastery_percent >= 40 ? "🟡" : "🔴"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm truncate">
                            {t.topic}
                            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">
                              ({ALL_SUBJECTS.find(s => s.id === t.subject)?.name || t.subject})
                            </span>
                          </div>
                          <Progress value={t.mastery_percent} className="h-1.5" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{t.mastery_percent}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Talent Detector */}
          {strongTopics.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Talentos Detectados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {strongTopics.slice(0, 5).map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>⭐</span>
                        <span className="text-xs sm:text-sm font-medium truncate">{t.topic}</span>
                        <Badge variant="outline" className="ml-auto text-[10px] sm:text-xs shrink-0">{t.mastery_percent}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Grade Prediction */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Previsão de Nota
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictions.length === 0 ? (
                  <div className="text-muted-foreground text-sm text-center py-4">
                    Resolva exercícios para ver sua previsão! 📊
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3">
                    {predictions.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">{ALL_SUBJECTS.find(s => s.id === p.subject)?.name || p.subject}</span>
                        <span className={`text-base sm:text-lg font-bold ${p.predicted_grade >= 7 ? "text-green-500" : p.predicted_grade >= 5 ? "text-yellow-500" : "text-red-500"}`}>
                          {p.predicted_grade.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Lab Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Erros Frequentes
                  {errors.length > 0 && <Badge variant="destructive" className="ml-auto text-[10px] sm:text-xs">{errors.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {errorsLoading ? (
                  <div className="text-muted-foreground text-sm">Carregando...</div>
                ) : errors.length === 0 ? (
                  <div className="text-muted-foreground text-sm text-center py-4">
                    Nenhum erro registrado! Continue assim! 🎉
                  </div>
                ) : (
                  <div className="space-y-2">
                    {errors.slice(0, 4).map((e: any, i: number) => (
                      <div key={i} className="text-xs sm:text-sm p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                        <div className="font-medium truncate">{e.question_text}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          {ALL_SUBJECTS.find(s => s.id === e.subject)?.name || e.subject} • Errou {e.error_count}x
                        </div>
                      </div>
                    ))}
                    {errors.length > 4 && (
                      <Link to="/error-lab">
                        <Button variant="outline" size="sm" className="w-full text-xs">Ver todos os erros</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Trophy, label: "Ranking", desc: "Classificação", href: "/ranking", color: "text-yellow-500" },
            { icon: Sparkles, label: "Estudo Auto", desc: "IA escolhe", href: "/auto-study", color: "text-purple-500" },
            { icon: School, label: "Mapa Escola", desc: "Coletivo", href: "/school-map", color: "text-blue-500" },
            { icon: Timer, label: "Modo Foco", desc: "Concentração", href: "/focus", color: "text-green-500" },
          ].map((item) => (
            <Link key={item.label} to={item.href}>
              <Card className="hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
                  <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color} shrink-0`} />
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-medium block truncate">{item.label}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
