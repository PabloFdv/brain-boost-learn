import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, useProfile, getBattles, createBattle, joinBattle, submitBattleScore } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Trophy, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BATTLE_SUBJECTS = [
  { id: "matematica", name: "Matemática" },
  { id: "portugues", name: "Português" },
  { id: "historia", name: "História" },
  { id: "ciencias", name: "Ciências" },
  { id: "geografia", name: "Geografia" },
];

const SAMPLE_QUESTIONS = [
  { q: "Quanto é 15 × 8?", options: ["110", "120", "130", "140"], correct: "120" },
  { q: "Quanto é 144 ÷ 12?", options: ["10", "11", "12", "13"], correct: "12" },
  { q: "Quanto é 7² + 3²?", options: ["52", "58", "49", "40"], correct: "58" },
  { q: "Qual raiz de 169?", options: ["11", "12", "13", "14"], correct: "13" },
  { q: "Quanto é 25% de 200?", options: ["25", "40", "50", "75"], correct: "50" },
];

export default function BattlePage() {
  const userKey = useUserKey();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("matematica");
  const [playing, setPlaying] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userKey) {
      getBattles(userKey).then(r => setBattles(r.battles || [])).catch(console.error).finally(() => setLoading(false));
    }
  }, [userKey]);

  const handleCreate = async () => {
    if (!userKey || !profile) return;
    setCreating(true);
    try {
      const res = await createBattle(userKey, profile.display_name, subject, SAMPLE_QUESTIONS);
      setBattles(prev => [res.battle, ...prev]);
      toast({ title: "Batalha criada!", description: "Aguardando oponente..." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao criar batalha", variant: "destructive" });
    }
    setCreating(false);
  };

  const handleJoin = async (battle: any) => {
    if (!userKey || !profile) return;
    try {
      const res = await joinBattle(battle.id, userKey, profile.display_name);
      setPlaying(res.battle);
      setCurrentQ(0);
      setScore(0);
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const questions = playing?.questions || SAMPLE_QUESTIONS;
    if (answer === questions[currentQ]?.correct) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        // Battle complete
        if (userKey && playing) {
          submitBattleScore(playing.id, userKey, score + (answer === questions[currentQ]?.correct ? 1 : 0));
        }
        toast({ title: "Batalha finalizada!", description: `Você acertou ${score + (answer === questions[currentQ]?.correct ? 1 : 0)}/${questions.length}` });
        setPlaying(null);
      }
    }, 1500);
  };

  // Playing mode
  if (playing) {
    const questions = playing.questions || SAMPLE_QUESTIONS;
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 md:p-6 max-w-xl">
          <div className="flex justify-between items-center mb-6">
            <Badge variant="outline">Questão {currentQ + 1}/{questions.length}</Badge>
            <Badge className="gap-1"><Trophy className="h-3 w-3" />{score} acertos</Badge>
          </div>
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">{q.q}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt: string) => (
                    <Button key={opt} variant={answered ? (opt === q.correct ? "default" : opt === selectedAnswer ? "destructive" : "outline") : "outline"}
                      className="h-14 text-lg" onClick={() => handleAnswer(opt)} disabled={answered}
                    >
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Swords className="h-8 w-8 text-red-500" />
            Batalha
          </h1>
          <p className="text-muted-foreground mt-1">Desafie outros alunos!</p>
        </motion.div>

        {/* Create Battle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Criar Desafio</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATTLE_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={creating}>
              <Swords className="h-4 w-4 mr-2" />
              {creating ? "Criando..." : "Criar"}
            </Button>
          </CardContent>
        </Card>

        {/* Battles List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Batalhas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Carregando...</div>
            ) : battles.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhuma batalha disponível. Crie uma!</div>
            ) : battles.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{b.challenger_name} {b.opponent_name ? `vs ${b.opponent_name}` : "(aguardando...)"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(b.created_at).toLocaleDateString()}
                    <Badge variant="outline" className="text-xs">{b.subject}</Badge>
                  </div>
                </div>
                {b.status === "pending" && b.challenger_key !== userKey && (
                  <Button size="sm" onClick={() => handleJoin(b)}>Aceitar</Button>
                )}
                {b.status === "completed" && (
                  <Badge variant={b.winner_key === userKey ? "default" : "secondary"}>
                    {b.winner_key === userKey ? "Vitória!" : b.winner_key === "draw" ? "Empate" : "Derrota"}
                  </Badge>
                )}
                {b.status === "pending" && b.challenger_key === userKey && (
                  <Badge variant="outline">Aguardando</Badge>
                )}
                {b.status === "active" && (
                  <Button size="sm" onClick={() => { setPlaying(b); setCurrentQ(0); setScore(0); }}>Jogar</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
