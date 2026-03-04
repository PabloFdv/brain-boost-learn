import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Sparkles, Target, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import GradeCard from "@/components/GradeCard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { grades } from "@/data/curriculum";

const Index = () => {
  const regularGrades = grades.filter(g => g.level === "Ensino Fundamental" || g.level === "Ensino Médio");
  const specialGrades = grades.filter(g => g.level === "Formação Especial" || g.level === "Formação Técnica");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pb-12 pt-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <BookOpen className="h-3.5 w-3.5" />
              Baseado na BNCC
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-foreground mb-4">
              Estude{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                todas as disciplinas
              </span>
              <br />
              do 6º ano ao Ensino Médio
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
              Conteúdo completo e didático para avaliações, provas e ENEM.
              Aulas com IA, explicações claras, analogias simples e exercícios interativos.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span>14+ disciplinas</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>9 módulos completos</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Aulas com IA + Exercícios</span>
              </div>
            </div>

            <Link to="/chat">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Perguntar ao Professor IA
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Regular Grades */}
      <section className="container mx-auto px-4 pb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">
            Ensino Regular
          </h2>
          <p className="text-muted-foreground mb-6">
            Do 6º ano ao 3º ano do Ensino Médio — conteúdo completo da BNCC.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {regularGrades.map((grade, index) => (
              <GradeCard key={grade.id} grade={grade} index={index} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Special Sections */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">
            Formação Especial
          </h2>
          <p className="text-muted-foreground mb-6">
            Nacionalismo Desenvolvimentista e Técnico em Mecatrônica (SENAI).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specialGrades.map((grade, index) => (
              <GradeCard key={grade.id} grade={grade} index={index + regularGrades.length} />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
