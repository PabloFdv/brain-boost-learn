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
import { ALL_SUBJECTS, SAMPLE_QUESTIONS_BY_SUBJECT } from "@/lib/constants";

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
  const [playing, setPlaying] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startChallenge = () => {
    const qs = shuffleArray(SAMPLE_QUESTIONS_BY_SUBJECT[subject] || []);
    // Duplicate questions to have enough for 30s
    const extendedQs = [...qs, ...shuffleArray(qs), ...shuffleArray(qs)];
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
        addXP(userKey, score * 15 + 10, "challenge_30s");
      }
      toast({ title: `⚡ Desafio encerrado!`, description: `Você acertou ${score} em 30 segundos!` });
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, timeLeft]);

  const handleAnswer = (answer: string) => {
    if (!playing) return;
    const q = questions[currentQ];
    const correct = answer === q.correct;
    if (correct) setScore(s => s + 1);
    if (userKey) {
      recordAnswer(userKey, { grade: "geral", subject, topic: "desafio-30s", correct, question_text: q.q });
    }
    if (currentQ + 1 < questions.length) {
      setCurrentQ(c => c + 1);
    } else {
      setFinished(true);
      setPlaying(false);
    }
  };

  if (finished) {
    const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="text-center">
              <CardContent className="p-8 space-y-4">
                <div className="text-6xl">⚡</div>
                <h2 className="text-3xl font-bold">Desafio 30s</h2>
                <p className="text-muted-foreground">{subjectName}</p>
                <div className="text-6xl font-bold text-primary">{score}</div>
                <p className="text-lg text-muted-foreground">acertos em 30 segundos</p>
                <div className="text-sm text-muted-foreground">+{score * 15 + 10} XP ganhos</div>
                <div className="flex gap-3 justify-center pt-4">
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
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="text-lg gap-1 px-3 py-1">
              <Timer className="h-4 w-4" />{timeLeft}s
            </Badge>
            <Badge className="text-lg gap-1 px-3 py-1">
              <Trophy className="h-4 w-4" />{score}
            </Badge>
          </div>
          <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 text-center">{q.q}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt: string) => (
                    <Button key={opt} variant="outline" className="h-14 text-base font-medium" onClick={() => handleAnswer(opt)}>
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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500" />
            Desafio 30 Segundos
          </h1>
          <p className="text-muted-foreground mt-1">Responda o máximo de questões em 30 segundos!</p>
        </motion.div>

        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-7xl">⚡</div>
            <h2 className="text-2xl font-bold">Raciocínio Rápido</h2>
            <p className="text-muted-foreground">Questões aparecem rapidamente. Acerte o máximo!</p>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="max-w-48 mx-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="lg" onClick={startChallenge} className="w-full max-w-48">
              <Zap className="h-5 w-5 mr-2" />Começar!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
