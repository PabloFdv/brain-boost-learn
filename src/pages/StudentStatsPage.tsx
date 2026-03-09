import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useUserKey, useErrors, useBrainMap, useProfile } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, TrendingDown, TrendingUp, BookOpen, AlertTriangle, Target,
  Brain, Flame, CheckCircle, XCircle, ArrowRight, Loader2, RefreshCw,
} from "lucide-react";
import { ALL_SUBJECTS_WITH_TECHNICAL, GRADES } from "@/lib/constants";

interface ErrorStat {
  subject: string;
  topic: string;
  grade: string;
  error_count: number;
  question_text: string;
  correct_answer?: string;
  wrong_answer?: string;
  resolved: boolean;
}

interface TopicProgress {
  subject: string;
  topic: string;
  grade: string;
  mastery_percent: number;
  total_attempts: number;
  correct_count: number;
  wrong_count: number;
  last_practiced_at?: string;
}

// Group errors by subject -> topic
function groupErrorsBySubject(errors: ErrorStat[]) {
  const grouped: Record<string, { subject: string; subjectName: string; topics: Record<string, { count: number; questions: ErrorStat[] }> }> = {};
  for (const err of errors) {
    if (err.resolved) continue;
    if (!grouped[err.subject]) {
      const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === err.subject)?.name || err.subject;
      grouped[err.subject] = { subject: err.subject, subjectName, topics: {} };
    }
    const topicKey = err.topic;
    if (!grouped[err.subject].topics[topicKey]) {
      grouped[err.subject].topics[topicKey] = { count: 0, questions: [] };
    }
    grouped[err.subject].topics[topicKey].count += err.error_count;
    grouped[err.subject].topics[topicKey].questions.push(err);
  }
  return Object.values(grouped).sort((a, b) => {
    const aTotal = Object.values(a.topics).reduce((sum, t) => sum + t.count, 0);
    const bTotal = Object.values(b.topics).reduce((sum, t) => sum + t.count, 0);
    return bTotal - aTotal;
  });
}

// Get weakest topics from brain map
function getWeakTopics(topics: TopicProgress[], limit = 8) {
  return topics
    .filter(t => t.total_attempts > 0)
    .sort((a, b) => a.mastery_percent - b.mastery_percent)
    .slice(0, limit);
}

// Get strongest topics
function getStrongTopics(topics: TopicProgress[], limit = 5) {
  return topics
    .filter(t => t.total_attempts >= 3)
    .sort((a, b) => b.mastery_percent - a.mastery_percent)
    .slice(0, limit);
}

// Generate review suggestions
function generateSuggestions(errors: ErrorStat[], topics: TopicProgress[]) {
  const suggestions: { title: string; description: string; subject: string; topic: string; grade: string; priority: "high" | "medium" | "low"; type: string }[] = [];

  // Repeated errors (high priority)
  const repeatedErrors = errors.filter(e => !e.resolved && e.error_count >= 2);
  const seenTopics = new Set<string>();

  for (const err of repeatedErrors.sort((a, b) => b.error_count - a.error_count).slice(0, 5)) {
    const key = `${err.subject}-${err.topic}`;
    if (seenTopics.has(key)) continue;
    seenTopics.add(key);
    const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === err.subject)?.name || err.subject;
    suggestions.push({
      title: `Revisar: ${err.topic}`,
      description: `Você errou ${err.error_count}x em ${subjectName}. Revisão urgente recomendada!`,
      subject: err.subject,
      topic: err.topic,
      grade: err.grade,
      priority: "high",
      type: "error_repeat",
    });
  }

  // Weak mastery topics (medium priority)
  const weakTopics = topics.filter(t => t.mastery_percent < 50 && t.total_attempts >= 2);
  for (const t of weakTopics.sort((a, b) => a.mastery_percent - b.mastery_percent).slice(0, 5)) {
    const key = `${t.subject}-${t.topic}`;
    if (seenTopics.has(key)) continue;
    seenTopics.add(key);
    const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === t.subject)?.name || t.subject;
    suggestions.push({
      title: `Fortalecer: ${t.topic}`,
      description: `Domínio de ${t.mastery_percent}% em ${subjectName}. Pratique mais para melhorar!`,
      subject: t.subject,
      topic: t.topic,
      grade: t.grade,
      priority: "medium",
      type: "low_mastery",
    });
  }

  // Not practiced recently (low priority)
  const now = Date.now();
  const staleTopics = topics.filter(t => {
    if (!t.last_practiced_at) return false;
    const daysSince = (now - new Date(t.last_practiced_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7 && t.mastery_percent < 80;
  });
  for (const t of staleTopics.sort((a, b) => a.mastery_percent - b.mastery_percent).slice(0, 3)) {
    const key = `${t.subject}-${t.topic}`;
    if (seenTopics.has(key)) continue;
    seenTopics.add(key);
    const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === t.subject)?.name || t.subject;
    suggestions.push({
      title: `Retomar: ${t.topic}`,
      description: `Faz mais de 7 dias sem praticar ${subjectName}. Não deixe esfriar!`,
      subject: t.subject,
      topic: t.topic,
      grade: t.grade,
      priority: "low",
      type: "stale",
    });
  }

  return suggestions;
}

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: AlertTriangle, label: "Urgente" },
  medium: { color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: Target, label: "Importante" },
  low: { color: "text-muted-foreground", bg: "bg-muted border-border", icon: RefreshCw, label: "Retomar" },
};

export default function StudentStatsPage() {
  const userKey = useUserKey();
  const { errors, loading: errorsLoading } = useErrors();
  const { topics: brainTopics, loading: brainLoading } = useBrainMap();
  const { profile, loading: profileLoading } = useProfile();

  const loading = errorsLoading || brainLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const groupedErrors = groupErrorsBySubject(errors);
  const weakTopics = getWeakTopics(brainTopics);
  const strongTopics = getStrongTopics(brainTopics);
  const suggestions = generateSuggestions(errors, brainTopics);

  const totalErrors = errors.filter(e => !e.resolved).length;
  const totalAttempts = brainTopics.reduce((s, t) => s + t.total_attempts, 0);
  const totalCorrect = brainTopics.reduce((s, t) => s + t.correct_count, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const avgMastery = brainTopics.length > 0
    ? Math.round(brainTopics.reduce((s, t) => s + t.mastery_percent, 0) / brainTopics.length)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            Estatísticas & Revisão
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Análise completa do seu desempenho com sugestões personalizadas de estudo
          </p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{overallAccuracy}%</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Taxa de Acerto</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold">{avgMastery}%</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Domínio Médio</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold">{totalAttempts}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Questões Feitas</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-destructive">{totalErrors}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Erros Pendentes</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Personalized Review Suggestions */}
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Revisão Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((s, i) => {
                  const cfg = priorityConfig[s.priority];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.bg}`}
                    >
                      <cfg.icon className={`h-5 w-5 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{s.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px] hidden sm:flex">{cfg.label}</Badge>
                        <Link to={`/${s.grade}/${s.subject}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            Estudar <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weakest Topics */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  Tópicos Mais Fracos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weakTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Sem dados suficientes. Continue praticando!
                  </p>
                ) : (
                  weakTopics.map((t, i) => {
                    const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === t.subject)?.name || t.subject;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate">{t.topic}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">{subjectName}</Badge>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${t.mastery_percent < 30 ? "text-destructive" : "text-primary"}`}>
                            {t.mastery_percent}%
                          </span>
                        </div>
                        <Progress value={t.mastery_percent} className="h-1.5" />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{t.correct_count}/{t.total_attempts} acertos</span>
                          <span>{t.wrong_count} erros</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Strongest Topics */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Seus Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {strongTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Pratique pelo menos 3 vezes em um tópico para ver aqui!
                  </p>
                ) : (
                  strongTopics.map((t, i) => {
                    const subjectName = ALL_SUBJECTS_WITH_TECHNICAL.find(s => s.id === t.subject)?.name || t.subject;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.topic}</p>
                          <p className="text-[10px] text-muted-foreground">{subjectName}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{t.mastery_percent}%</span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Errors by Subject */}
        {groupedErrors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Mapa de Erros por Matéria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedErrors.map((group, i) => {
                  const totalGroupErrors = Object.values(group.topics).reduce((s, t) => s + t.count, 0);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {group.subjectName}
                        </h4>
                        <Badge variant="destructive" className="text-[10px]">
                          {totalGroupErrors} erros
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(group.topics)
                          .sort(([, a], [, b]) => b.count - a.count)
                          .slice(0, 4)
                          .map(([topicName, data], j) => (
                            <div
                              key={j}
                              className="flex items-center justify-between p-2 rounded-md bg-destructive/5 border border-destructive/20 text-sm"
                            >
                              <span className="truncate mr-2">{topicName}</span>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {data.count}x
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {brainTopics.length === 0 && errors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold">Sem dados ainda</h3>
              <p className="text-sm text-muted-foreground">
                Faça simulados, desafios ou batalhas para começar a ver suas estatísticas de desempenho aqui.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/simulator">
                  <Button size="sm"><Target className="h-4 w-4 mr-2" />Simulado</Button>
                </Link>
                <Link to="/challenge30">
                  <Button size="sm" variant="outline"><Flame className="h-4 w-4 mr-2" />Desafio 30s</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
