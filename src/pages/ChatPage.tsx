import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Trash2, BookOpen, FileQuestion, Lightbulb, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import LessonContent from "@/components/LessonContent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const contextParam = searchParams.get("context");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideInput?: string, overrideMode?: string) => {
    const trimmed = (overrideInput || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-teacher`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            context: contextParam || undefined,
            mode: overrideMode || mode,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao processar pergunta");
      }

      if (!resp.body) throw new Error("No stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${err.message || "Erro ao processar sua pergunta. Tente novamente."}` },
      ]);
    } finally {
      setIsLoading(false);
      setMode(undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "Gerar Exercícios", icon: FileQuestion, mode: "exercise", prompt: "Gere 5 exercícios variados sobre " },
    { label: "Resumo Completo", icon: FileText, mode: "summary", prompt: "Faça um resumo completo sobre " },
    { label: "Explicar Erro", icon: Lightbulb, mode: "explain_error", prompt: "Me explique por que errei: " },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col container mx-auto max-w-3xl px-4 py-4">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <h2 className="text-xl font-bold font-display text-foreground mb-2">Professor IA</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-2">
                Pergunte qualquer coisa sobre qualquer disciplina! Eu explico de forma simples,
                com analogias do dia a dia, exercícios e sempre conferindo fontes.
              </p>
              {contextParam && (
                <Badge variant="secondary" className="mb-4">📚 Contexto: {contextParam}</Badge>
              )}

              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {quickActions.map((a) => (
                  <Button key={a.label} variant="outline" size="sm" className="gap-2"
                    onClick={() => { setInput(a.prompt); setMode(a.mode); textareaRef.current?.focus(); }}
                  >
                    <a.icon className="h-3.5 w-3.5" />{a.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {[
                  "O que é uma equação do 2º grau? Me dê exercícios!",
                  "Explique a Revolução Francesa com detalhes",
                  "Como funciona um motor elétrico? (SENAI)",
                  "Me ajude com interpretação de texto em inglês",
                  "Faça um resumo completo de termodinâmica",
                  "Gere 5 exercícios de porcentagem com gabarito",
                ].map((q) => (
                  <button key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-sm p-3 rounded-lg border border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`rounded-xl p-4 max-w-[85%] ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border shadow-card"
                }`}>
                  {msg.role === "assistant" ? <LessonContent content={msg.content} /> : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-xl p-4 bg-card border border-border shadow-card">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 bg-background pt-2 pb-20 lg:pb-4 border-t border-border">
          {/* Mode indicator */}
          {mode && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">Modo: {mode === "exercise" ? "Exercícios" : mode === "summary" ? "Resumo" : "Explicar Erro"}</Badge>
              <Button variant="ghost" size="sm" className="h-5 text-xs" onClick={() => setMode(undefined)}>✕</Button>
            </div>
          )}
          <div className="flex gap-2">
            {messages.length > 0 && (
              <Button variant="outline" size="icon" onClick={() => setMessages([])} title="Limpar chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Pergunte ao Professor IA..."
              className="min-h-[44px] max-h-[120px] resize-none" rows={1}
            />
            <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick mode buttons when in conversation */}
          {messages.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {quickActions.map((a) => (
                <Button key={a.label} variant="ghost" size="sm" className="text-xs gap-1 h-7"
                  onClick={() => { setMode(a.mode); textareaRef.current?.focus(); }}
                >
                  <a.icon className="h-3 w-3" />{a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
