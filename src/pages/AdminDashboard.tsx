import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Ban, RotateCcw, Copy, Check, LogOut, Key,
  ShieldCheck, Loader2, Unlock, Users, User, ChevronDown,
  Globe, Clock, Hash, ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAllStudents, getTurmaStats, getStudentDetail } from "@/hooks/useGamification";
import { TURMAS } from "@/lib/constants";

interface AccessKey {
  id: string; key: string; created_by: string; used: boolean;
  used_by: string | null; created_at: string; used_at: string | null; blocked: boolean;
}

interface GlobalKey {
  id: string; key: string; label: string; active: boolean;
  expires_at: string | null; max_uses: number | null; current_uses: number;
  created_at: string; turma: string | null;
}

const AdminDashboard = () => {
  const { role, adminKey, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [globalKeys, setGlobalKeys] = useState<GlobalKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Global key creation
  const [gkTurma, setGkTurma] = useState("");
  const [gkExpiry, setGkExpiry] = useState("");
  const [gkMaxUses, setGkMaxUses] = useState("");
  const [creatingGlobal, setCreatingGlobal] = useState(false);

  // Student analytics
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [turmaStats, setTurmaStats] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    if (role !== "admin") { navigate("/login"); return; }
    loadKeys();
    loadStudents();
  }, [role]);

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await getAllStudents();
      setAllStudents(res.students || []);
    } catch (e) { console.error(e); }
    setStudentsLoading(false);
  };

  useEffect(() => {
    if (selectedTurma) {
      getTurmaStats(selectedTurma).then(r => setTurmaStats(r.stats)).catch(console.error);
    } else { setTurmaStats(null); }
  }, [selectedTurma]);

  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);
    try {
      const res = await getStudentDetail(student.user_key);
      setStudentDetail(res);
    } catch { setStudentDetail(null); }
  };

  const apiCall = async (action: string, extra: any = {}) => {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminKey, ...extra }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Erro"); }
    return res.json();
  };

  const loadKeys = async () => {
    try {
      const data = await apiCall("list");
      setKeys(data.keys || []);
      setGlobalKeys(data.globalKeys || []);
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const generateKey = async () => {
    setGenerating(true);
    try {
      const data = await apiCall("generate");
      if (data.key) { setKeys(prev => [data.key, ...prev]); toast({ title: "Senha individual criada! 🔑", description: `Senha: ${data.key.key}` }); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setGenerating(false); }
  };

  const generateGlobalKey = async () => {
    if (!gkTurma) {
      toast({ title: "Selecione uma turma", variant: "destructive" });
      return;
    }
    setCreatingGlobal(true);
    try {
      const data = await apiCall("generate_global", {
        turma: gkTurma,
        expiresAt: gkExpiry ? new Date(gkExpiry).toISOString() : undefined,
        maxUses: gkMaxUses ? parseInt(gkMaxUses) : undefined,
      });
      if (data.globalKey) {
        setGlobalKeys(prev => [data.globalKey, ...prev]);
        toast({ title: "Key Global criada! 🌐", description: `Turma: ${gkTurma} • Senha: ${data.globalKey.key}` });
        setGkTurma(""); setGkExpiry(""); setGkMaxUses("");
      }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setCreatingGlobal(false); }
  };

  const handleAction = async (action: string, keyId: string, label: string) => {
    try { await apiCall(action, { keyId }); toast({ title: `${label} com sucesso!` }); loadKeys(); }
    catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const usedCount = keys.filter(k => k.used).length;
  const activeCount = keys.filter(k => !k.used && !k.blocked).length;
  const blockedCount = keys.filter(k => k.blocked).length;

  const filteredStudents = selectedTurma
    ? allStudents.filter(s => s.turma === selectedTurma)
    : allStudents;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold font-display text-foreground">Painel Admin</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Pablo Martins Santana</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        <Tabs defaultValue="students" className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="students" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Alunos</span><span className="sm:hidden">Alunos</span>
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Individuais</span><span className="sm:hidden">Keys</span>
            </TabsTrigger>
            <TabsTrigger value="global" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Globais</span><span className="sm:hidden">Global</span>
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4 sm:space-y-6">
            <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
              <Select value={selectedTurma || "all"} onValueChange={(v) => setSelectedTurma(v === "all" ? "" : v)}>
                <SelectTrigger className="max-w-64 sm:max-w-72 text-xs sm:text-sm"><SelectValue placeholder="Todas as turmas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {TURMAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs">{filteredStudents.length} alunos</Badge>
            </div>

            {turmaStats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                {[
                  { label: "Alunos", value: turmaStats.total_students },
                  { label: "XP Médio", value: turmaStats.avg_xp },
                  { label: "Nível Médio", value: turmaStats.avg_level },
                  { label: "Min. Estudados", value: turmaStats.total_minutes },
                  { label: "Ativos", value: turmaStats.active_students },
                ].map(s => (
                  <Card key={s.label}>
                    <CardContent className="p-2.5 sm:p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold text-primary">{s.value}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardHeader className="pb-2 sm:pb-3"><CardTitle className="text-base sm:text-lg">Alunos</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 sm:space-y-2">
                {studentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Nenhum aluno encontrado</div>
                ) : filteredStudents.map((s: any) => (
                  <div key={s.user_key} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewStudent(s)}>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {s.display_name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.display_name}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.turma || "Sem turma"} • Nv {s.level}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary text-xs sm:text-sm">{s.xp} XP</div>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedStudent && studentDetail && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />{selectedStudent.display_name}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}>✕</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                      {[
                        { label: "XP Total", value: selectedStudent.xp },
                        { label: "Nível", value: `Nv ${selectedStudent.level}` },
                        { label: "Sequência", value: `${selectedStudent.streak_days}🔥` },
                        { label: "Estudados", value: `${selectedStudent.total_study_minutes}m` },
                      ].map(s => (
                        <div key={s.label} className="text-center p-2 bg-muted rounded-lg">
                          <div className="font-bold text-primary text-sm">{s.value}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {studentDetail.progress?.length > 0 && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium mb-2">Progresso por tópico</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {studentDetail.progress.map((p: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${p.mastery_percent >= 70 ? "bg-green-500" : p.mastery_percent >= 40 ? "bg-yellow-500" : "bg-red-500"}`} />
                              <span className="flex-1 truncate">{p.topic}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">{p.mastery_percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Individual Keys Tab */}
          <TabsContent value="keys" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Disponíveis", value: activeCount, color: "text-primary" },
                { label: "Usadas", value: usedCount, color: "text-accent" },
                { label: "Bloqueadas", value: blockedCount, color: "text-destructive" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 text-center shadow-sm">
                  <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <Button onClick={generateKey} disabled={generating} className="w-full" size="lg">
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Gerar Senha Individual
            </Button>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
            ) : keys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma senha gerada ainda.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {keys.map((k) => (
                  <motion.div key={k.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm sm:text-lg font-bold font-mono text-foreground">{k.key}</code>
                        <button onClick={() => copyKey(k.key)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {copiedKey === k.key ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {k.blocked ? <Badge variant="destructive" className="text-[10px]">Bloqueada</Badge>
                        : k.used ? <Badge variant="secondary" className="text-[10px]">Usada</Badge>
                        : <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Ativa</Badge>}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                      {new Date(k.created_at).toLocaleDateString("pt-BR")}
                      {k.used_by && ` • ${k.used_by}`}
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      {k.blocked ? (
                        <Button size="sm" variant="outline" className="text-xs h-7 sm:h-8" onClick={() => handleAction("unblock", k.id, "Desbloqueada")}>
                          <Unlock className="h-3 w-3 mr-1" /> Desbloquear
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7 sm:h-8" onClick={() => handleAction("block", k.id, "Bloqueada")}>
                          <Ban className="h-3 w-3 mr-1" /> Bloquear
                        </Button>
                      )}
                      {k.used && (
                        <Button size="sm" variant="outline" className="text-xs h-7 sm:h-8" onClick={() => handleAction("reset", k.id, "Resetada")}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="text-xs h-7 sm:h-8" onClick={() => handleAction("delete", k.id, "Apagada")}>
                        <Trash2 className="h-3 w-3 mr-1" /> Apagar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Global Keys Tab */}
          <TabsContent value="global" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Criar Key Global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs font-medium">Turma *</Label>
                  <Select value={gkTurma} onValueChange={setGkTurma}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                    <SelectContent>
                      {TURMAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">A senha será gerada automaticamente. Alunos dessa turma serão auto-vinculados.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label className="text-xs">Expira em (opcional)</Label>
                    <Input type="datetime-local" value={gkExpiry} onChange={e => setGkExpiry(e.target.value)} className="mt-1 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Máx. usos (opcional)</Label>
                    <Input type="number" placeholder="∞" value={gkMaxUses} onChange={e => setGkMaxUses(e.target.value)} className="mt-1 text-xs sm:text-sm" />
                  </div>
                </div>
                <Button onClick={generateGlobalKey} disabled={creatingGlobal || !gkTurma} className="w-full">
                  {creatingGlobal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                  Criar Key Global
                </Button>
              </CardContent>
            </Card>

            {globalKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma key global criada.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {globalKeys.map((gk) => (
                  <motion.div key={gk.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <code className="text-sm sm:text-lg font-bold font-mono text-foreground truncate">{gk.key}</code>
                        <button onClick={() => copyKey(gk.key)} className="text-muted-foreground hover:text-foreground shrink-0">
                          {copiedKey === gk.key ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <Badge variant={gk.active ? "default" : "destructive"} className="text-[10px] shrink-0">
                        {gk.active ? "Ativa" : "Off"}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm font-medium">{gk.label}</div>
                    {gk.turma && (
                      <Badge variant="secondary" className="text-[10px] mt-1">{gk.turma}</Badge>
                    )}
                    <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{gk.current_uses}{gk.max_uses ? `/${gk.max_uses}` : ""}</span>
                      {gk.expires_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(gk.expires_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-2.5">
                      <Button size="sm" variant="outline" className="text-xs h-7 sm:h-8" onClick={() => handleAction("toggle_global", gk.id, gk.active ? "Desativada" : "Ativada")}>
                        {gk.active ? <ToggleRight className="h-3 w-3 mr-1" /> : <ToggleLeft className="h-3 w-3 mr-1" />}
                        {gk.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs h-7 sm:h-8" onClick={() => handleAction("delete_global", gk.id, "Apagada")}>
                        <Trash2 className="h-3 w-3 mr-1" /> Apagar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
