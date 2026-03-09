import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, useProfile, getBattles, createBattle, joinBattle, submitBattleScore, deleteBattle, addXP } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Trophy, Clock, Users, Trash2, Loader2, Play, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ALL_SUBJECTS_WITH_TECHNICAL as ALL_SUBJECTS, GRADES } from "@/lib/constants";
import AnswerFeedback, { playFeedbackSound } from "@/components/AnswerFeedback";

interface AIQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  topic_tag?: string;
}

interface AnsweredQuestion {
  question: AIQuestion;
  userAnswer: string;
  correct: boolean;
}

// Separate subjects
const regularSubjects = ALL_SUBJECTS.filter(
  s => !["automacao","dev-sistemas","mecatronica","mecanica","edificacoes","eletromec","iot"].includes(s.id)
);
const technicalSubjects = ALL_SUBJECTS.filter(
  s => ["automacao","dev-sistemas","mecatronica","mecanica","edificacoes","eletromec","iot"].includes(s.id)
);

function BattlePlay({ battle, userKey, onFinish }: { battle: any; userKey: string; onFinish: (answeredQs: AnsweredQuestion[], finalScore: number) => void }) {
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const questions: AIQuestion[] = battle.questions || [];
  const q = questions[currentQ];

  if (!q) return null;

  const subjectName = ALL_SUBJECTS.find(s => s.id === battle.subject)?.name || battle.subject;
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const isCorrect = answer === q.correct;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setFeedback({ show: true, correct: isCorrect });
    playFeedbackSound(isCorrect);

    setAnsweredQuestions(prev => [...prev, { question: q, userAnswer: answer, correct: isCorrect }]);

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        submitBattleScore(battle.id, userKey, newScore).catch(console.error);
        toast({ title: "⚔️ Batalha finalizada!", description: `Você acertou ${newScore}/${questions.length}` });
        onFinish([...answeredQuestions, { question: q, userAnswer: answer, correct: isCorrect }], newScore);
      }
    }, 800);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-xl">
      <AnswerFeedback show={feedback.show} correct={feedback.correct} />
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="text-xs">{subjectName}</Badge>
        <Badge variant="outline">Q {currentQ + 1}/{questions.length}</Badge>
        <Badge className="gap-1"><Trophy className="h-3 w-3" />{score}</Badge>
      </div>
      <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            {q.topic_tag && (
              <Badge variant="secondary" className="text-[10px] mb-3">{q.topic_tag}</Badge>
            )}
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 leading-snug">{q.question}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt: string, i: number) => {
                let variant: "outline" | "default" | "destructive" = "outline";
                if (answered) {
                  if (opt === q.correct) variant = "default";
                  else if (opt === selectedAnswer) variant = "destructive";
                }
                return (
                  <Button
                    key={i}
                    variant={variant}
                    className={`h-auto min-h-[3rem] py-2 text-sm sm:text-base whitespace-normal text-left justify-start transition-all ${
                      answered && opt === q.correct ? "ring-2 ring-primary" : ""
                    } ${answered && opt === selectedAnswer && opt !== q.correct ? "ring-2 ring-destructive" : ""}`}
                    onClick={() => handleAnswer(opt)}
                    disabled={answered}
                  >
                    <span className="font-bold mr-2 shrink-0">{String.fromCharCode(65 + i)}.</span>
                    <span>{opt}</span>
                  </Button>
                );
              })}
            </div>
            {/* Show explanation after answering */}
            {answered && q.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-muted/50 border"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  💡 <strong>Explicação:</strong> {q.explanation}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function BattleReview({ answeredQuestions, score, questionsCount, subject, onClose }: {
  answeredQuestions: AnsweredQuestion[];
  score: number;
  questionsCount: number;
  subject: string;
  onClose: () => void;
}) {
  const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;
  const gradeScore = (score / questionsCount) * 10;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="text-center">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="text-5xl">⚔️</div>
            <h2 className="text-2xl sm:text-3xl font-bold">Batalha Finalizada</h2>
            <p className="text-muted-foreground">{subjectName}</p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{score}</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-muted-foreground">{questionsCount - score}</div>
                <div className="text-xs text-muted-foreground">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{gradeScore.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Nota</div>
              </div>
            </div>
            <Button onClick={onClose}>Voltar às Batalhas</Button>
          </CardContent>
        </Card>
      </motion.div>

      {answeredQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Gabarito Comentado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {answeredQuestions.map((aq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 sm:p-4 rounded-lg border text-sm ${
                  aq.correct
                    ? "border-primary/30 bg-primary/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {aq.correct
                    ? <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  }
                  <p className="font-medium leading-snug">{i + 1}. {aq.question.question}</p>
                </div>
                {aq.question.topic_tag && (
                  <Badge variant="outline" className="text-[10px] mb-2 ml-6">{aq.question.topic_tag}</Badge>
                )}
                <div className="space-y-1 ml-6">
                  {!aq.correct && (
                    <p className="text-xs text-destructive">
                      ❌ Sua resposta: <span className="font-medium">{aq.userAnswer}</span>
                    </p>
                  )}
                  <p className="text-xs text-foreground">
                    ✅ Correta: <span className="font-medium">{aq.question.correct}</span>
                  </p>
                  {aq.question.explanation && (
                    <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                      💡 {aq.question.explanation}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
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
  const [reviewData, setReviewData] = useState<{ answered: AnsweredQuestion[]; score: number; questionsCount: number; subject: string } | null>(null);

  const loadBattles = () => {
    if (userKey) {
      setLoading(true);
      getBattles(userKey).then(r => setBattles(r.battles || [])).catch(console.error).finally(() => setLoading(false));
    }
  };

  useEffect(() => { loadBattles(); }, [userKey]);

  const fetchAIQuestions = async (): Promise<AIQuestion[] | null> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          subject,
          topic: "Conteúdo variado do currículo",
          numQuestions: 5,
          mode: "challenge",
        }),
      });
      const data = await res.json();
      if (data.questions?.length > 0) {
        return data.questions;
      }
      toast({ title: "Erro ao gerar questões", description: data.error || "Tente novamente", variant: "destructive" });
      return null;
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" });
      return null;
    }
  };

  const handleCreate = async () => {
    if (!userKey || !profile) return;
    setCreating(true);
    try {
      const questions = await fetchAIQuestions();
      if (!questions) {
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

  const handleBattleFinish = (answered: AnsweredQuestion[], finalScore: number) => {
    if (playing) {
      setReviewData({
        answered,
        score: finalScore,
        questionsCount: playing.questions?.length || 0,
        subject: playing.subject,
      });
      setPlaying(null);
    }
    loadBattles();
  };

  // Show review screen after battle
  if (reviewData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BattleReview
          answeredQuestions={reviewData.answered}
          score={reviewData.score}
          questionsCount={reviewData.questionsCount}
          subject={reviewData.subject}
          onClose={() => { setReviewData(null); loadBattles(); }}
        />
      </div>
    );
  }

  if (playing && userKey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BattlePlay battle={playing} userKey={userKey} onFinish={handleBattleFinish} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Swords className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
            Batalha PvP
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Desafie outros alunos com questões geradas por IA — gabarito comentado ao final!
          </p>
        </motion.div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Criar Desafio</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ano/Série</label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Matéria</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_d1" disabled>── Disciplinas ──</SelectItem>
                    {regularSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    <SelectItem value="_d2" disabled>── Técnicas SENAI ──</SelectItem>
                    {technicalSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full sm:w-auto">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Swords className="h-4 w-4 mr-2" />}
              {creating ? "Gerando questões com IA..." : "Criar Batalha"}
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
              <div className="text-center text-muted-foreground py-8 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : battles.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhuma batalha ativa. Crie uma!</div>
            ) : battles.map((b: any) => {
              const sName = ALL_SUBJECTS.find(s => s.id === b.subject)?.name || b.subject;
              const isOwner = b.challenger_key === userKey;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
