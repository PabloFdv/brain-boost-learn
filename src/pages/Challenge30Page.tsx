import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, addXP, recordAnswer } from "@/hooks/useGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Trophy, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ALL_SUBJECTS, GRADES, getQuestionsForGradeSubject } from "@/lib/constants";
import AnswerFeedback, { playFeedbackSound } from "@/components/AnswerFeedback";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Challenge30Page() {
  const userKey = useUserKey();
  const { toast } = useToast();
  const [subject, setSubject] = useState("matematica");
  const [grade, setGrade] = useState("1em");
  const [playing, setPlaying] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const timerRef = useRef<number | null>(null);

  const startChallenge = () => {
    const qs = getQuestionsForGradeSubject(grade, subject);
    if (qs.length === 0) {
      toast({ title: "Sem questões disponíveis para essa combinação", variant: "destructive" });
      return;
    }
    const extendedQs = [...shuffleArray(qs), ...shuffleArray(qs), ...shuffleArray(qs)];
    setQuestions(extendedQs);
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(30);
    setFinished(false);
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
      toast({ title: `⚡ Desafio encerrado!`, description: `Você acertou ${score} em 30 segundos!` });
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, timeLeft]);

  const handleAnswer = (answer: string) => {
    if (!playing || feedback.show) return;
    const q = questions[currentQ];
    const correct = answer === q.correct;
    if (correct) setScore(s => s + 1);
    
    // Show feedback
    setFeedback({ show: true, correct });
    playFeedbackSound(correct);
    
    if (userKey) {
      recordAnswer(userKey, { grade, subject, topic: "desafio-30s", correct, question_text: q.q });
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
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="text-center">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="text-5xl sm:text-6xl">⚡</div>
                <h2 className="text-2xl sm:text-3xl font-bold">Desafio 30s</h2>
                <p className="text-muted-foreground">{subjectName} • {gradeName}</p>
                <div className="text-5xl sm:text-6xl font-bold text-primary">{score}</div>
                <p className="text-base sm:text-lg text-muted-foreground">acertos em 30 segundos</p>
                <div className="text-sm text-muted-foreground">+{xpGained} XP ganhos</div>
                {score >= 10 && <Badge className="bg-yellow-500/20 text-yellow-600">🏆 Badge: Veloz!</Badge>}
                <div className="flex gap-3 justify-center pt-4 flex-wrap">
                  <Button onClick={startChallenge} size="lg">Tentar de Novo</Button>
                  <Button variant="outline" onClick={() => setFinished(false)}>Trocar Matéria</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
            <motion.div className={`h-full rounded-full ${timeLeft <= 10 ? "bg-red-500" : "bg-primary"}`}
              animate={{ width: `${100 - progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="flex justify-between items-center mb-4">
            <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="text-base sm:text-lg gap-1 px-3 py-1">
              <Timer className="h-4 w-4" />{timeLeft}s
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              {ALL_SUBJECTS.find(s => s.id === subject)?.name}
            </Badge>
            <Badge className="text-base sm:text-lg gap-1 px-3 py-1">
              <Trophy className="h-4 w-4" />{score}
            </Badge>
          </div>
          <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">{q.q}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {q.options.map((opt: string) => (
                    <Button key={opt} variant="outline" className="h-12 sm:h-14 text-sm sm:text-base font-medium whitespace-normal" onClick={() => handleAnswer(opt)}>
                      {opt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Responda o máximo de questões em 30 segundos!</p>
        </motion.div>

        <Card className="text-center">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-6xl sm:text-7xl">⚡</div>
            <h2 className="text-xl sm:text-2xl font-bold">Raciocínio Rápido</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Questões aparecem rapidamente. Acerte o máximo!</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" onClick={startChallenge} className="w-full max-w-52">
              <Zap className="h-5 w-5 mr-2" />Começar!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
