import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, useErrors, getExamRadar, reportExam } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Target, TrendingUp, BookOpen, Brain, Zap, Calendar, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ALL_SUBJECTS, GRADES } from "@/lib/constants";

export default function ExamAlertPage() {
  const userKey = useUserKey();
  const { errors } = useErrors();
  const { toast } = useToast();

  const [grade, setGrade] = useState("1em");
  const [subject, setSubject] = useState("matematica");
  const [radar, setRadar] = useState<any[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);

  // Report exam form
  const [showReport, setShowReport] = useState(false);
  const [examTopics, setExamTopics] = useState("");
  const [examDifficulty, setExamDifficulty] = useState("3");
  const [examNotes, setExamNotes] = useState("");

  // Smart review: errors with error_count >= 2
  const repeatedErrors = errors.filter((e: any) => e.error_count >= 2).sort((a: any, b: any) => b.error_count - a.error_count);

  useEffect(() => {
    loadRadar();
  }, [grade, subject]);

  const loadRadar = async () => {
    setRadarLoading(true);
    try {
      const res = await getExamRadar(grade, subject);
      setRadar(res.radar || []);
    } catch { setRadar([]); }
    setRadarLoading(false);
  };

  const handleReport = async () => {
    if (!userKey || !examTopics.trim()) return;
    try {
      await reportExam(userKey, {
        grade,
        subject,
        topics_appeared: examTopics.split(",").map(t => t.trim()).filter(Boolean),
        difficulty: parseInt(examDifficulty),
        notes: examNotes || undefined,
      });
      toast({ title: "Prova reportada! 📝", description: "Os dados ajudarão outros alunos." });
      setShowReport(false);
      setExamTopics("");
      setExamNotes("");
      loadRadar();
    } catch {
      toast({ title: "Erro ao reportar", variant: "destructive" });
    }
  };

  const subjectName = ALL_SUBJECTS.find(s => s.id === subject)?.name || subject;
  const gradeName = GRADES.find(g => g.id === grade)?.name || grade;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500" />
            Alerta de Provas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Radar de prova + Revisão inteligente de erros repetidos</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-36 sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GRADES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-36 sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Exam Radar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-orange-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Radar de Prova — {subjectName}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowReport(!showReport)} className="gap-1">
                  <Plus className="h-3 w-3" />{showReport ? "Cancelar" : "Reportar Prova"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showReport && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Reportar tópicos da prova</p>
                  <Input placeholder="Tópicos separados por vírgula (ex: Equações, Funções)" value={examTopics} onChange={e => setExamTopics(e.target.value)} />
                  <div className="flex gap-3">
                    <Select value={examDifficulty} onValueChange={setExamDifficulty}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(d => <SelectItem key={d} value={d.toString()}>Dificuldade {d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Observações (opcional)" value={examNotes} onChange={e => setExamNotes(e.target.value)} className="flex-1" />
                  </div>
                  <Button onClick={handleReport} className="w-full" disabled={!examTopics.trim()}>
                    <Calendar className="h-4 w-4 mr-2" />Reportar Prova
                  </Button>
                </motion.div>
              )}

              {radarLoading ? (
                <p className="text-muted-foreground text-sm text-center py-4">Carregando...</p>
              ) : radar.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Target className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">Nenhum dado de prova ainda para {subjectName} — {gradeName}.</p>
                  <p className="text-xs text-muted-foreground">Reporte provas para alimentar o radar!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {radar.slice(0, 10).map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 text-right">
                        <span className={`text-sm font-bold ${r.probability >= 60 ? "text-red-500" : r.probability >= 30 ? "text-yellow-500" : "text-muted-foreground"}`}>
                          {r.probability}%
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{r.topic}</span>
                          {r.probability >= 60 && <Badge variant="destructive" className="text-[10px] h-4">Alta chance</Badge>}
                        </div>
                        <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${r.probability >= 60 ? "bg-red-500" : r.probability >= 30 ? "bg-yellow-500" : "bg-muted-foreground/30"}`}
                            style={{ width: `${r.probability}%` }} />
                        </div>
                      </div>
                      <Link to={`/chat?context=${encodeURIComponent(`${subjectName}: ${r.topic}`)}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs h-7">
                          <BookOpen className="h-3 w-3" />Treinar
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Auto-Review */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-red-500" />
                Revisão Automática Inteligente
                {repeatedErrors.length > 0 && <Badge variant="destructive" className="ml-auto">{repeatedErrors.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {repeatedErrors.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Zap className="h-10 w-10 mx-auto text-green-500/50" />
                  <p className="text-muted-foreground text-sm">Nenhum erro repetido detectado! 🎉</p>
                  <p className="text-xs text-muted-foreground">Continue estudando — erros repetidos aparecerão aqui automaticamente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Estes tópicos têm erros repetidos. Treine-os para dominar!
                  </p>
                  {repeatedErrors.slice(0, 8).map((err: any, i: number) => {
                    const errSubject = ALL_SUBJECTS.find(s => s.id === err.subject)?.name || err.subject;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="p-3 rounded-lg border border-red-500/15 bg-red-500/5 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${err.error_count >= 4 ? "bg-red-500 text-white" : "bg-orange-500/20 text-orange-600"}`}>
                            {err.error_count}×
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">{err.question_text}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] h-4">{errSubject}</Badge>
                              <span className="text-[10px] text-muted-foreground">{err.topic}</span>
                            </div>
                            {err.correct_answer && (
                              <p className="text-xs text-green-600 mt-1">✅ Resposta: {err.correct_answer}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/chat?context=${encodeURIComponent(`Me explique detalhadamente: ${err.question_text}`)}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full gap-1 text-xs h-7">
                              <Brain className="h-3 w-3" />Entender
                            </Button>
                          </Link>
                          <Link to={`/chat?context=${encodeURIComponent(`Gere 3 exercícios similares a: ${err.question_text} (${errSubject})`)}`} className="flex-1">
                            <Button size="sm" className="w-full gap-1 text-xs h-7">
                              <RefreshCw className="h-3 w-3" />Treinar
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/error-lab">
            <Card className="hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <span className="text-sm font-medium block">Lab de Erros</span>
                  <span className="text-xs text-muted-foreground">Todos os erros</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/simulator">
            <Card className="hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-3 flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="text-sm font-medium block">Simulado</span>
                  <span className="text-xs text-muted-foreground">Modo prova</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}