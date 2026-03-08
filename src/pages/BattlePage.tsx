import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, useProfile, getBattles, createBattle, joinBattle, submitBattleScore, deleteBattle, addXP } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Trophy, Clock, Users, Trash2, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ALL_SUBJECTS_WITH_TECHNICAL as ALL_SUBJECTS, GRADES, getQuestionsForGradeSubject } from "@/lib/constants";
import AnswerFeedback, { playFeedbackSound } from "@/components/AnswerFeedback";

function BattlePlay({ battle, userKey, onFinish }: { battle: any; userKey: string; onFinish: () => void }) {
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const questions = battle.questions || [];
  const q = questions[currentQ];

  if (!q) return null;

  const subjectName = ALL_SUBJECTS.find(s => s.id === battle.subject)?.name || battle.subject;

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const isCorrect = answer === q.correct;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    // Show feedback
    setFeedback({ show: true, correct: isCorrect });
    playFeedbackSound(isCorrect);

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        submitBattleScore(battle.id, userKey, newScore).catch(console.error);
        toast({ title: "⚔️ Batalha finalizada!", description: `Você acertou ${newScore}/${questions.length}` });
        onFinish();
      }
    }, 800);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-xl">
      <AnswerFeedback show={feedback.show} correct={feedback.correct} />
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline">{subjectName}</Badge>
        <Badge variant="outline">Q {currentQ + 1}/{questions.length}</Badge>
        <Badge className="gap-1"><Trophy className="h-3 w-3" />{score}</Badge>
      </div>
      <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">{q.q}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt: string) => {
                let variant: "outline" | "default" | "destructive" = "outline";
                if (answered) {
                  if (opt === q.correct) variant = "default";
                  else if (opt === selectedAnswer) variant = "destructive";
                }
                return (
                  <Button key={opt}
                    variant={variant}
                    className={`h-12 sm:h-14 text-sm sm:text-base whitespace-normal transition-all ${
                      answered && opt === q.correct ? "ring-2 ring-green-500 bg-green-500/10" : ""
                    } ${answered && opt === selectedAnswer && opt !== q.correct ? "ring-2 ring-red-500 bg-red-500/10" : ""}`}
                    onClick={() => handleAnswer(opt)} disabled={answered}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function BattlePage() {
  const userKey = useUserKey();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("matematica");
  const [grade, setGrade] = useState("1em");
  const [playing, setPlaying] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const loadBattles = () => {
    if (userKey) {
      setLoading(true);
      getBattles(userKey).then(r => setBattles(r.battles || [])).catch(console.error).finally(() => setLoading(false));
    }
  };

  useEffect(() => { loadBattles(); }, [userKey]);

  const handleCreate = async () => {
    if (!userKey || !profile) return;
    setCreating(true);
    try {
      const questions = getQuestionsForGradeSubject(grade, subject);
      if (!questions || questions.length === 0) {
        toast({ title: "Sem questões para essa combinação", variant: "destructive" });
        setCreating(false);
        return;
      }
      const res = await createBattle(userKey, profile.display_name, subject, questions);
      setBattles(prev => [res.battle, ...prev]);
      const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;
      const gradeName = GRADES.find(g => g.id === grade)?.name || grade;
      toast({ title: "⚔️ Batalha criada!", description: `${subjectName} (${gradeName}) — Aguardando oponente...` });
    } catch {
      toast({ title: "Erro", description: "Falha ao criar batalha", variant: "destructive" });
    }
    setCreating(false);
  };

  const handleDelete = async (battleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userKey) return;
    try {
      await deleteBattle(battleId, userKey);
      setBattles(prev => prev.filter(b => b.id !== battleId));
      toast({ title: "Batalha removida ✅" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const handleJoin = async (battle: any) => {
    if (!userKey || !profile) return;
    try {
      const res = await joinBattle(battle.id, userKey, profile.display_name);
      setPlaying(res.battle);
    } catch {
      toast({ title: "Erro ao entrar", variant: "destructive" });
    }
  };

  if (playing && userKey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BattlePlay battle={playing} userKey={userKey} onFinish={() => { setPlaying(null); loadBattles(); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Swords className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" />
            Batalha PvP
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Desafie outros alunos em qualquer matéria e ano!</p>
        </motion.div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Criar Desafio</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-32 sm:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="flex-1 min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full sm:w-auto">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Swords className="h-4 w-4 mr-2" />}
              {creating ? "Criando..." : "Criar Batalha"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />Batalhas ({battles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Carregando...</div>
            ) : battles.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhuma batalha. Crie uma!</div>
            ) : battles.map((b: any) => {
              const sName = ALL_SUBJECTS.find(s => s.id === b.subject)?.name || b.subject;
              const isOwner = b.challenger_key === userKey;
              return (
                <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm sm:text-base">
                      {b.challenger_name} {b.opponent_name ? `vs ${b.opponent_name}` : "(aguardando...)"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="outline" className="text-[10px] h-4">{sName}</Badge>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(b.created_at).toLocaleDateString("pt-BR")}</span>
                      {b.status === "completed" && <span className="font-medium">{b.challenger_score} × {b.opponent_score}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {b.status === "pending" && !isOwner && <Button size="sm" onClick={() => handleJoin(b)} className="h-7 text-xs">Aceitar</Button>}
                    {b.status === "pending" && isOwner && <Badge variant="outline" className="text-[10px]">Aguardando</Badge>}
                    {b.status === "active" && (
                      <Button size="sm" onClick={() => setPlaying(b)} className="gap-1 h-7 text-xs">
                        <Play className="h-3 w-3" />Jogar
                      </Button>
                    )}
                    {b.status === "completed" && (
                      <Badge variant={b.winner_key === userKey ? "default" : b.winner_key === "draw" ? "secondary" : "destructive"} className="text-[10px]">
                        {b.winner_key === userKey ? "Vitória!" : b.winner_key === "draw" ? "Empate" : "Derrota"}
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(b.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
