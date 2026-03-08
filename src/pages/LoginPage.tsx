import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Loader2, BookOpen, ShieldAlert, Globe, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

const LoginPage = () => {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setAdminKey, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Global key onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fullName, setFullName] = useState("");
  const [onboardingData, setOnboardingData] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setLoading(true);
    try {
      // Get or create device_id for global key tracking
      let deviceId = localStorage.getItem("epistemologia_device_id");
      if (!deviceId) {
        deviceId = `dev_${crypto.randomUUID().slice(0, 12)}`;
        localStorage.setItem("epistemologia_device_id", deviceId);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            key: key.trim(),
            device_id: `global_${key.trim()}_${deviceId}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro de acesso",
          description: data.error || "Senha inválida",
          variant: "destructive",
        });
        return;
      }

      if (data.role === "admin") {
        login(data.role, data.name, data.token);
        setAdminKey(key.trim());
        toast({ title: `Bem-vindo, ${data.name}! 👑`, description: "Acesso de administrador liberado." });
        navigate("/admin");
        return;
      }

      // Global key - needs setup (new user)
      if (data.key_type === "global" && data.needs_setup) {
        setOnboardingData(data);
        setShowOnboarding(true);
        return;
      }

      // Normal login (individual key or returning global user)
      login(data.role, data.name, data.token);
      const userKey = data.user_device_id || key.trim();
      localStorage.setItem("epistemologia_user_key", userKey);
      toast({ title: `Bem-vindo, ${data.name}! 🎉`, description: "Bons estudos!" });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!fullName.trim() || !onboardingData) return;
    setLoading(true);
    try {
      let deviceId = localStorage.getItem("epistemologia_device_id") || `dev_${crypto.randomUUID().slice(0, 12)}`;
      localStorage.setItem("epistemologia_device_id", deviceId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            key: key.trim(),
            device_id: `global_${key.trim()}_${deviceId}`,
            full_name: fullName.trim(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Erro", description: data.error || "Erro ao criar conta", variant: "destructive" });
        return;
      }

      login(data.role, data.name, data.token);
      const userKey = data.user_device_id || key.trim();
      localStorage.setItem("epistemologia_user_key", userKey);
      toast({ title: `Bem-vindo, ${data.name}! 🎉`, description: `Turma: ${data.turma || "Nenhuma"}. Bons estudos!` });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {showOnboarding ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold font-display text-foreground">Criar sua conta</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Primeira vez com essa senha? Configure seu perfil.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              {onboardingData?.turma && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Turma auto-selecionada</div>
                    <div className="text-sm font-semibold text-foreground">{onboardingData.turma}</div>
                  </div>
                </div>
              )}

              {onboardingData?.label && (
                <Badge variant="secondary" className="w-full justify-center py-1.5">
                  {onboardingData.label}
                </Badge>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && handleCompleteOnboarding()}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCompleteOnboarding} 
                className="w-full" 
                size="lg" 
                disabled={loading || !fullName.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Começar a estudar
              </Button>

              <button 
                onClick={() => { setShowOnboarding(false); setOnboardingData(null); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                ← Voltar ao login
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">EPISTEMOLOGIA</h1>
              <p className="text-muted-foreground mt-2 text-sm">Acesse com sua senha de estudante</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="pl-10 h-12 text-base"
                    autoFocus
                    maxLength={20}
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading || !key.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-2" />
                  )}
                  Entrar
                </Button>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p>Sua sessão fica salva permanentemente neste dispositivo.</p>
                  <p className="mt-1 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Senhas globais criam usuários únicos por dispositivo.
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
