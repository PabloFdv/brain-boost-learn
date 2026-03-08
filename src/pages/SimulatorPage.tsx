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
import { ALL_SUBJECTS, GRADES } from "@/lib/constants";

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

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const q = questions[currentQ];
    const correct = answer === q.correct || answer === q.correctAnswer;
    const newAnswer = { question: currentQ, answer, correct, time: Date.now() - startTime };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (userKey) {
      recordAnswer(userKey, { grade, subject, topic: "Simulado", correct, question_text: q.question || q.text, wrong_answer: correct ? undefined : answer, correct_answer: q.correct || q.correctAnswer });
    }

    setTimeout(() => {
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
    const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;
    const gradeName = GRADES.find(g => g.id === grade)?.name || grade;
    const isPerfect = totalCorrect === questions.length;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-xl space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="text-center">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="text-5xl sm:text-6xl">{gradeScore >= 7 ? "🎉" : gradeScore >= 5 ? "😊" : "😅"}</div>
                <h2 className="text-2xl sm:text-3xl font-bold">Simulado de {subjectName}</h2>
                <p className="text-sm text-muted-foreground">{gradeName}</p>
                <div className="text-4xl sm:text-5xl font-bold text-primary">{gradeScore.toFixed(1)}</div>
                <div className="text-muted-foreground">Nota estimada</div>
                {isPerfect && <Badge className="bg-yellow-500/20 text-yellow-600 text-sm">🎯 Badge: Simulado Perfeito!</Badge>}
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{totalCorrect}</div>
                    <div className="text-xs text-muted-foreground">Acertos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{questions.length - totalCorrect}</div>
                    <div className="text-xs text-muted-foreground">Erros</div>
                  </div>
                </div>
                <Button onClick={() => { setQuestions([]); setFinished(false); }} className="mt-4">Novo Simulado</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentQ];
    const opts = q.options || q.alternatives || [];
    const progress = ((currentQ) / questions.length) * 100;
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
                <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">{q.question || q.text}</h2>
                <div className="space-y-2 sm:space-y-3">
                  {opts.map((opt: any, i: number) => {
                    const optText = typeof opt === "string" ? opt : opt.text || opt.label;
                    const isCorrect = optText === (q.correct || q.correctAnswer);
                    return (
                      <Button key={i} variant={answered ? (isCorrect ? "default" : optText === selectedAnswer ? "destructive" : "outline") : "outline"}
                        className="w-full justify-start h-auto py-3 text-left text-sm" onClick={() => handleAnswer(optText)} disabled={answered}
                      >
                        <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                        {optText}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Target className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />
            Simulador de Prova
          </h1>
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
                    {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
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
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando...</> : "Começar Simulado"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}