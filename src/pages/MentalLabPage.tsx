import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, recordAnswer, addXP } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Calculator, BookOpen, Lightbulb, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dynamic question generation for mental training
function generateMathQ(): { q: string; options: string[]; correct: string } {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, result: number;
  switch (op) {
    case "+": a = Math.floor(Math.random() * 90) + 10; b = Math.floor(Math.random() * 90) + 10; result = a + b; break;
    case "-": a = Math.floor(Math.random() * 90) + 20; b = Math.floor(Math.random() * a); result = a - b; break;
    default: a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; result = a * b; break;
  }
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const w = result + (Math.floor(Math.random() * 20) - 10);
    if (w !== result && w > 0) wrong.add(w);
  }
  const options = [result, ...Array.from(wrong)].sort(() => Math.random() - 0.5).map(String);
  return { q: `${a} ${op} ${b} = ?`, options, correct: String(result) };
}

function generateLogicQ(): { q: string; options: string[]; correct: string } {
  const sequences = [
    { seq: "2, 4, 8, 16, __", answer: "32", opts: ["24", "32", "30", "28"] },
    { seq: "1, 1, 2, 3, 5, __", answer: "8", opts: ["6", "7", "8", "10"] },
    { seq: "3, 6, 12, 24, __", answer: "48", opts: ["36", "42", "48", "30"] },
    { seq: "1, 4, 9, 16, __", answer: "25", opts: ["20", "25", "30", "36"] },
    { seq: "10, 8, 6, 4, __", answer: "2", opts: ["0", "1", "2", "3"] },
  ];
  const s = sequences[Math.floor(Math.random() * sequences.length)];
  return { q: `Sequência: ${s.seq}`, options: s.opts.sort(() => Math.random() - 0.5), correct: s.answer };
}

const MODES = [
  { id: "calc", name: "Cálculo Mental", icon: Calculator, description: "Treine velocidade de cálculo", color: "text-blue-500", generator: generateMathQ },
  { id: "logic", name: "Lógica", icon: Lightbulb, description: "Padrões e sequências", color: "text-yellow-500", generator: generateLogicQ },
];

export default function MentalLabPage() {
  const userKey = useUserKey();
  const { toast } = useToast();
  const [mode, setMode] = useState<string | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const startMode = (modeId: string) => {
    setMode(modeId);
    setScore(0);
    setTotal(0);
    nextQuestion(modeId);
  };

  const nextQuestion = (modeId?: string) => {
    const m = MODES.find(m => m.id === (modeId || mode));
    if (m) {
      setQuestion(m.generator());
      setAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const correct = answer === question.correct;
    if (correct) setScore(s => s + 1);
    setTotal(t => t + 1);
    if (userKey) {
      recordAnswer(userKey, { grade: "geral", subject: "logica", topic: `lab-${mode}`, correct, question_text: question.q });
    }
    setTimeout(() => nextQuestion(), 800);
  };

  const finish = () => {
    if (userKey && score > 0) addXP(userKey, score * 10, `mental-lab-${mode}`);
    toast({ title: "🧠 Treino completo!", description: `${score}/${total} acertos • +${score * 10} XP` });
    setMode(null);
    setQuestion(null);
  };

  if (mode && question) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-xl space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-base">{MODES.find(m => m.id === mode)?.name}</Badge>
            <Badge className="gap-1"><Trophy className="h-3 w-3" />{score}/{total}</Badge>
          </div>
          <motion.div key={total} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 text-center">{question.q}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((opt: string) => (
                    <Button key={opt}
                      variant={answered ? (opt === question.correct ? "default" : opt === selectedAnswer ? "destructive" : "outline") : "outline"}
                      className="h-14 text-lg" onClick={() => handleAnswer(opt)} disabled={answered}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <Button variant="outline" onClick={finish} className="w-full">Encerrar Treino</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            Laboratório Mental
          </h1>
          <p className="text-muted-foreground mt-1">Academia do cérebro — treinos específicos</p>
        </motion.div>

        <div className="grid gap-4">
          {MODES.map((m) => (
            <Card key={m.id} className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => startMode(m.id)}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-14 w-14 rounded-xl bg-muted flex items-center justify-center ${m.color}`}>
                  <m.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
