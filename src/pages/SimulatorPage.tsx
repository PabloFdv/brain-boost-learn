import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, recordAnswer, addXP } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ALL_SUBJECTS_WITH_TECHNICAL, GRADES } from "@/lib/constants";
import AnswerFeedback, { playFeedbackSound } from "@/components/AnswerFeedback";

export default function SimulatorPage() {
  const userKey = useUserKey();
  const { toast } = useToast();
  const [subject, setSubject] = useState("matematica");
  const [grade, setGrade] = useState("1em");
  const [numQuestions, setNumQuestions] = useState("10");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const [startTime] = useState(Date.now());

  const handleStart = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, topic: "Simulado Geral", numQuestions: parseInt(numQuestions) }),
      });
      const data = await res.json();
      if (data.questions?.length > 0) {
        setQuestions(data.questions);
        setCurrentQ(0);
        setAnswers([]);
        setFinished(false);
      } else {
        toast({ title: "Erro ao gerar questões", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao gerar simulado", variant: "destructive" });
    }
    setGenerating(false);
  };

  const getCorrectAnswer = (q: any) => {
    // Handle both text-based and index-based correct answers
    if (q.correctAnswer) return q.correctAnswer;
    if (typeof q.correct === "number" && q.options) return q.options[q.correct];
    return q.correct;
  };

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const q = questions[currentQ];
    const correctText = getCorrectAnswer(q);
    const correct = answer === correctText;
    const newAnswer = { question: currentQ, answer, correct, time: Date.now() - startTime };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // Show feedback
    setFeedback({ show: true, correct });
    playFeedbackSound(correct);

    if (userKey) {
      recordAnswer(userKey, { grade, subject, topic: "Simulado", correct, question_text: q.question || q.text, wrong_answer: correct ? undefined : answer, correct_answer: correctText });
    }

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
        const totalCorrect = newAnswers.filter(a => a.correct).length;
        const isPerfect = totalCorrect === questions.length;
        if (userKey) addXP(userKey, totalCorrect * 10 + 20, isPerfect ? "simulado_perfeito" : "simulado");
      }
    }, 1200);
  };

  if (finished) {
    const totalCorrect = answers.filter(a => a.correct).length;
    const gradeScore = (totalCorrect / questions.length) * 10;
    const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === subject)?.name || subject;
    const gradeName = GRADES.find(g => g.id === grade)?.name || grade;
    const isPerfect = totalCorrect === questions.length;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="text-center">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="text-5xl sm:text-6xl">{gradeScore >= 7 ? "🎉" : gradeScore >= 5 ? "😊" : "😅"}</div>
                <h2 className="text-2xl sm:text-3xl font-bold">Simulado de {subjectName}</h2>
                <p className="text-sm text-muted-foreground">{gradeName}</p>
                <div className="text-4xl sm:text-5xl font-bold text-primary">{gradeScore.toFixed(1)}</div>
                <div className="text-muted-foreground">Nota estimada</div>
                {isPerfect && <Badge variant="secondary">🎯 Simulado Perfeito!</Badge>}
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalCorrect}</div>
                    <div className="text-xs text-muted-foreground">Acertos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{questions.length - totalCorrect}</div>
                    <div className="text-xs text-muted-foreground">Erros</div>
                  </div>
                </div>
                <Button onClick={() => { setQuestions([]); setFinished(false); }} className="mt-4">Novo Simulado</Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Full Gabarito Comentado */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-base flex items-center gap-2 mb-4">
                📝 Gabarito Comentado ({questions.length} questões)
              </h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {questions.map((q, i) => {
                  const a = answers[i];
                  const correctText = getCorrectAnswer(q);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`p-3 sm:p-4 rounded-lg border text-sm ${
                        a?.correct
                          ? "border-primary/30 bg-primary/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {a?.correct
                          ? <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          : <span className="text-destructive shrink-0 mt-0.5">❌</span>
                        }
                        <p className="font-medium leading-snug">{i + 1}. {q.question || q.text}</p>
                      </div>
                      {q.topic_tag && (
                        <Badge variant="outline" className="text-[10px] mb-2 ml-6">{q.topic_tag}</Badge>
                      )}
                      <div className="space-y-1 ml-6">
                        {!a?.correct && a?.answer && (
                          <p className="text-xs text-destructive">
                            ❌ Sua resposta: <span className="font-medium">{a.answer}</span>
                          </p>
                        )}
                        <p className="text-xs text-foreground">
                          ✅ Correta: <span className="font-medium">{correctText}</span>
                        </p>
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                            💡 <strong>Explicação:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentQ];
    const opts = q.options || q.alternatives || [];
    const correctText = getCorrectAnswer(q);
    const progress = ((currentQ) / questions.length) * 100;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <AnswerFeedback show={feedback.show} correct={feedback.correct} />
        <div className="container mx-auto p-4 md:p-6 max-w-xl">
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <Badge variant="outline">Questão {currentQ + 1}/{questions.length}</Badge>
            <Badge className="gap-1"><CheckCircle className="h-3 w-3" />{answers.filter(a => a.correct).length} acertos</Badge>
          </div>
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 leading-relaxed">{q.question || q.text}</h2>
                <div className="space-y-2 sm:space-y-3">
                  {opts.map((opt: any, i: number) => {
                    const optText = typeof opt === "string" ? opt : opt.text || opt.label;
                    const isCorrect = optText === correctText;
                    return (
                      <Button key={i} variant={answered ? (isCorrect ? "default" : optText === selectedAnswer ? "destructive" : "outline") : "outline"}
                        className="w-full justify-start h-auto py-3 text-left text-sm whitespace-normal leading-relaxed" onClick={() => handleAnswer(optText)} disabled={answered}
                      >
                        <span className="mr-2 font-bold shrink-0">{String.fromCharCode(65 + i)}.</span>
                        <span>{optText}</span>
                      </Button>
                    );
                  })}
                </div>
                {answered && q.explanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted/50 border">
                    <p className="text-xs sm:text-sm text-muted-foreground"><strong>💡 Explicação:</strong> {q.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Separate regular and technical subjects
  const regularSubjects = ALL_SUBJECTS_WITH_TECHNICAL.filter(s => !["automacao","dev-sistemas","mecatronica","mecanica","edificacoes","eletromec","iot"].includes(s.id));
  const technicalSubjects = ALL_SUBJECTS_WITH_TECHNICAL.filter(s => ["automacao","dev-sistemas","mecatronica","mecanica","edificacoes","eletromec","iot"].includes(s.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Target className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />
            Simulador de Prova
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Questões geradas por IA no estilo ENEM/vestibular</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Configurar Simulado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Ano/Série</label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Matéria</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_divider_regular" disabled>── Disciplinas ──</SelectItem>
                    {regularSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    <SelectItem value="_divider_tech" disabled>── Técnicas SENAI ──</SelectItem>
                    {technicalSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Questões</label>
              <Select value={numQuestions} onValueChange={setNumQuestions}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questões</SelectItem>
                  <SelectItem value="10">10 questões</SelectItem>
                  <SelectItem value="15">15 questões</SelectItem>
                  <SelectItem value="20">20 questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStart} disabled={generating} className="w-full" size="lg">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando simulado...</> : "Começar Simulado"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
