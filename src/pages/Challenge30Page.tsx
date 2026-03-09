import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, addXP, recordAnswer } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Trophy, Timer, CheckCircle, XCircle, BookOpen, Loader2 } from "lucide-react";
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

// Separate subjects into regular and technical for display
const regularSubjects = ALL_SUBJECTS.filter(
  s => !["automacao","dev-sistemas","mecatronica","mecanica","edificacoes","eletromec","iot"].includes(s.id)
);
const technicalSubjects = ALL_SUBJECTS.filter(
  s => ["automacao","dev-sistemas","mecatronica","mecanica","edificacoes","eletromec","iot"].includes(s.id)
);

export default function Challenge30Page() {
  const userKey = useUserKey();
  const { toast } = useToast();
  const [subject, setSubject] = useState("matematica");
  const [grade, setGrade] = useState("1em");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef<number | null>(null);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          subject,
          topic: "Conteúdo variado do currículo",
          numQuestions: 20,
          mode: "challenge",
        }),
      });
      const data = await res.json();
      if (data.questions?.length > 0) {
        return data.questions as AIQuestion[];
      } else {
        toast({ title: "Erro ao gerar questões", description: data.error || "Tente novamente", variant: "destructive" });
        return null;
      }
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" });
      return null;
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startChallenge = async () => {
    const qs = await fetchQuestions();
    if (!qs) return;
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(30);
    setFinished(false);
    setAnsweredQuestions([]);
    setShowReview(false);
    setPlaying(true);
  };

  useEffect(() => {
    if (playing && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (playing && timeLeft <= 0) {
      setFinished(true);
      setPlaying(false);
      if (userKey) {
        const xpGained = score * 15 + 10;
        addXP(userKey, xpGained, "challenge_30s");
      }
      toast({ title: `⚡ Desafio encerrado!`, description: `Você acertou ${score} questões em 30 segundos!` });
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, timeLeft]);

  const handleAnswer = (answer: string) => {
    if (!playing || feedback.show) return;
    const q = questions[currentQ];
    const isCorrect = answer === q.correct;
    if (isCorrect) setScore(s => s + 1);

    setFeedback({ show: true, correct: isCorrect });
    playFeedbackSound(isCorrect);

    setAnsweredQuestions(prev => [...prev, { question: q, userAnswer: answer, correct: isCorrect }]);

    if (userKey) {
      recordAnswer(userKey, {
        grade, subject, topic: "desafio-30s",
        correct: isCorrect,
        question_text: q.question,
        wrong_answer: isCorrect ? undefined : answer,
        correct_answer: q.correct,
      });
    }

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
      } else {
        setFinished(true);
        setPlaying(false);
      }
    }, 400);
  };

  if (finished) {
    const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;
    const gradeName = GRADES.find(g => g.id === grade)?.name || grade;
    const xpGained = score * 15 + 10;
    const totalAnswered = answeredQuestions.length;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="text-center">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="text-5xl sm:text-6xl">⚡</div>
                <h2 className="text-2xl sm:text-3xl font-bold">Desafio 30s</h2>
                <p className="text-muted-foreground">{subjectName} • {gradeName}</p>
                <div className="text-5xl sm:text-6xl font-bold text-primary">{score}</div>
                <p className="text-base sm:text-lg text-muted-foreground">
                  acertos de {totalAnswered} tentativas em 30 segundos
                </p>
                <div className="text-sm text-muted-foreground font-medium text-green-600">+{xpGained} XP ganhos</div>
                {score >= 10 && <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">🏆 Badge: Veloz!</Badge>}
                {score >= 15 && <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">🚀 Badge: Super Veloz!</Badge>}

                <div className="flex gap-3 justify-center pt-2 flex-wrap">
                  <Button onClick={startChallenge} size="lg" disabled={loadingQuestions}>
                    {loadingQuestions ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Tentar de Novo
                  </Button>
                  <Button variant="outline" onClick={() => setFinished(false)}>Trocar Matéria</Button>
                  {answeredQuestions.length > 0 && (
                    <Button variant="outline" onClick={() => setShowReview(r => !r)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      {showReview ? "Ocultar" : "Ver"} Gabarito
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Review / Gabarito Section */}
          <AnimatePresence>
            {showReview && answeredQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Gabarito Comentado ({answeredQuestions.length} questões respondidas)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {answeredQuestions.map((aq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`p-3 sm:p-4 rounded-lg border text-sm ${
                          aq.correct
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-red-500/30 bg-red-500/5"
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {aq.correct
                            ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          }
                          <p className="font-medium leading-snug">{i + 1}. {aq.question.question}</p>
                        </div>
                        {aq.question.topic_tag && (
                          <Badge variant="outline" className="text-[10px] mb-2">{aq.question.topic_tag}</Badge>
                        )}
                        <div className="space-y-1 ml-6">
                          {!aq.correct && (
                            <p className="text-xs text-red-600">
                              ❌ Sua resposta: <span className="font-medium">{aq.userAnswer}</span>
                            </p>
                          )}
                          <p className="text-xs text-green-700">
                            ✅ Resposta correta: <span className="font-medium">{aq.question.correct}</span>
                          </p>
                          {aq.question.explanation && (
                            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                              💡 <strong>Explicação:</strong> {aq.question.explanation}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (playing) {
    const q = questions[currentQ];
    if (!q) return null;
    const progress = ((30 - timeLeft) / 30) * 100;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <AnswerFeedback show={feedback.show} correct={feedback.correct} />
        <div className="container mx-auto p-4 md:p-6 max-w-xl">
          {/* Timer bar */}
          <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timeLeft <= 10 ? "bg-destructive" : "bg-primary"}`}
              animate={{ width: `${100 - progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="text-base sm:text-lg gap-1 px-3 py-1">
              <Timer className="h-4 w-4" />{timeLeft}s
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm max-w-[120px] truncate">
              {ALL_SUBJECTS.find(s => s.id === subject)?.name}
            </Badge>
            <Badge className="text-base sm:text-lg gap-1 px-3 py-1">
              <Trophy className="h-4 w-4" />{score}
            </Badge>
          </div>
          <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            <Card>
              <CardContent className="p-4 sm:p-6">
                {q.topic_tag && (
                  <Badge variant="secondary" className="text-[10px] mb-3">{q.topic_tag}</Badge>
                )}
                <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 leading-snug">{q.question}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {q.options.map((opt: string, i: number) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-auto min-h-[3rem] py-2 text-sm sm:text-base font-medium whitespace-normal text-left justify-start"
                      onClick={() => handleAnswer(opt)}
                    >
                      <span className="font-bold mr-2 shrink-0">{String.fromCharCode(65 + i)}.</span>
                      <span>{opt}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Questão {currentQ + 1} de {questions.length}
          </p>
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-500" />
            Desafio 30 Segundos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            IA gera questões únicas do currículo — responda o máximo em 30 segundos!
          </p>
        </motion.div>

        <Card className="text-center">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-6xl sm:text-7xl">⚡</div>
            <h2 className="text-xl sm:text-2xl font-bold">Raciocínio Rápido com IA</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Questões variadas geradas pela IA alinhadas ao currículo. Gabarito comentado ao final!
            </p>
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
                    <SelectItem value="_div1" disabled>── Disciplinas ──</SelectItem>
                    {regularSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    <SelectItem value="_div2" disabled>── Técnicas SENAI ──</SelectItem>
                    {technicalSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="lg" onClick={startChallenge} disabled={loadingQuestions} className="w-full">
              {loadingQuestions ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando questões com IA...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Começar Desafio!
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              A IA prepara 20 questões únicas antes de iniciar o cronômetro
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
