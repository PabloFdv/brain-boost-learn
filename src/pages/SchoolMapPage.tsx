import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { callGamification } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingDown, TrendingUp, School } from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/constants";

const GRADES = [
  { id: "6ano", name: "6º Ano" },
  { id: "7ano", name: "7º Ano" },
  { id: "8ano", name: "8º Ano" },
  { id: "9ano", name: "9º Ano" },
  { id: "1em", name: "1º Ano EM" },
  { id: "2em", name: "2º Ano EM" },
  { id: "3em", name: "3º Ano EM" },
];

export default function SchoolMapPage() {
  const [subject, setSubject] = useState("matematica");
  const [grade, setGrade] = useState("1em");
  const [classBrain, setClassBrain] = useState<any[]>([]);
  const [examRadar, setExamRadar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      callGamification("get_class_brain", { grade, subject }),
      callGamification("get_exam_radar", { grade, subject }),
    ]).then(([brain, radar]) => {
      setClassBrain(brain.topics || []);
      setExamRadar(radar.radar || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [subject, grade]);

  const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <School className="h-8 w-8 text-blue-500" />
            Inteligência da Escola
          </h1>
          <p className="text-muted-foreground mt-1">Mapa coletivo de dificuldades e previsões de prova</p>
        </motion.div>

        <div className="flex gap-3 flex-wrap">
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="max-w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GRADES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="max-w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Carregando dados...</CardContent></Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Cérebro da Turma — {subjectName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classBrain.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados coletivos ainda. Mais alunos precisam praticar!</p>
                ) : (
                  <div className="space-y-3">
                    {classBrain.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg">
                          {t.error_rate >= 50 ? "🔴" : t.error_rate >= 25 ? "🟡" : "🟢"}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{t.topic}</span>
                            <span className="text-muted-foreground">{t.error_rate}% erram</span>
                          </div>
                          <Progress value={t.error_rate} className="h-2" />
                        </div>
                        {t.error_rate >= 50 ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  📡 Radar de Prova — {subjectName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examRadar.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Alunos podem reportar provas para alimentar o radar. Quanto mais dados, melhor a previsão!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {examRadar.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Badge variant={r.probability >= 60 ? "destructive" : r.probability >= 30 ? "secondary" : "outline"} className="min-w-14 justify-center">
                          {r.probability}%
                        </Badge>
                        <span className="text-sm font-medium flex-1">{r.topic}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.probability >= 60 ? "Alta chance" : r.probability >= 30 ? "Média" : "Baixa"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
