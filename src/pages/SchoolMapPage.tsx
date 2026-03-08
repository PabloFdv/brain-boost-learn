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

export default function SchoolMapPage() {
  const [subject, setSubject] = useState("matematica");
  const [classBrain, setClassBrain] = useState<any[]>([]);
  const [examRadar, setExamRadar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      callGamification("get_class_brain", { grade: "9ano", subject }),
      callGamification("get_exam_radar", { grade: "9ano", subject }),
    ]).then(([brain, radar]) => {
      setClassBrain(brain.topics || []);
      setExamRadar(radar.radar || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [subject]);

  const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <School className="h-8 w-8 text-blue-500" />
            Inteligência da Escola
          </h1>
          <p className="text-muted-foreground mt-1">Mapa coletivo de dificuldades e previsões de prova</p>
        </motion.div>

        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="max-w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Carregando dados...</CardContent></Card>
        ) : (
          <>
            {/* Class Brain Map */}
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

            {/* Exam Radar */}
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
