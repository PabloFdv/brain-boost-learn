import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Ban, RotateCcw, Copy, Check, LogOut, Key,
  ShieldCheck, Loader2, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AccessKey {
  id: string;
  key: string;
  created_by: string;
  used: boolean;
  used_by: string | null;
  created_at: string;
  used_at: string | null;
  blocked: boolean;
}

const AdminDashboard = () => {
  const { role, adminKey, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/login");
      return;
    }
    loadKeys();
  }, [role]);

  const apiCall = async (action: string, keyId?: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-keys`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminKey, keyId }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erro");
    }
    return res.json();
  };

  const loadKeys = async () => {
    try {
      const data = await apiCall("list");
      setKeys(data.keys || []);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    try {
      const data = await apiCall("generate");
      if (data.key) {
        setKeys(prev => [data.key, ...prev]);
        toast({ title: "Senha criada! 🔑", description: `Senha: ${data.key.key}` });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (action: string, keyId: string, label: string) => {
    try {
      await apiCall(action, keyId);
      toast({ title: `${label} com sucesso!` });
      loadKeys();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const usedCount = keys.filter(k => k.used).length;
  const activeCount = keys.filter(k => !k.used && !k.blocked).length;
  const blockedCount = keys.filter(k => k.blocked).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Painel Admin</h1>
              <p className="text-sm text-muted-foreground">Gerencie as senhas de acesso</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-accent">{usedCount}</p>
            <p className="text-xs text-muted-foreground">Usadas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-destructive">{blockedCount}</p>
            <p className="text-xs text-muted-foreground">Bloqueadas</p>
          </div>
        </div>

        {/* Generate button */}
        <Button onClick={generateKey} disabled={generating} className="w-full mb-6" size="lg">
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Gerar Nova Senha
        </Button>

        {/* Keys list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma senha gerada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold font-mono text-foreground">{k.key}</code>
                    <button onClick={() => copyKey(k.key)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copiedKey === k.key ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {k.blocked ? (
                      <Badge variant="destructive">Bloqueada</Badge>
                    ) : k.used ? (
                      <Badge variant="secondary">Usada</Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-primary/20">Ativa</Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-3">
                  Criada em {new Date(k.created_at).toLocaleDateString("pt-BR")}
                  {k.used_at && ` • Usada em ${new Date(k.used_at).toLocaleDateString("pt-BR")}`}
                </div>

                <div className="flex gap-2">
                  {k.blocked ? (
                    <Button size="sm" variant="outline" onClick={() => handleAction("unblock", k.id, "Desbloqueada")}>
                      <Unlock className="h-3 w-3 mr-1" /> Desbloquear
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleAction("block", k.id, "Bloqueada")}>
                      <Ban className="h-3 w-3 mr-1" /> Bloquear
                    </Button>
                  )}
                  {k.used && (
                    <Button size="sm" variant="outline" onClick={() => handleAction("reset", k.id, "Resetada")}>
                      <RotateCcw className="h-3 w-3 mr-1" /> Resetar
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleAction("delete", k.id, "Apagada")}>
                    <Trash2 className="h-3 w-3 mr-1" /> Apagar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
