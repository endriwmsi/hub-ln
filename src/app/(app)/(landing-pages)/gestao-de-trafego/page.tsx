/** biome-ignore-all lint/suspicious/noArrayIndexKey: supress use of the index rule. */
"use client";

import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconChartBar,
  IconCheck,
  IconDeviceAnalytics,
  IconMessageCircle,
  IconRocket,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

// ============ COMPONENTES AUXILIARES ============

function AnimatedCounter({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - (1 - progress) ** 4;
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

function InfiniteCarousel({
  items,
  speed = 30,
}: {
  items: string[];
  speed?: number;
}) {
  return (
    <div className="relative overflow-hidden py-4">
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-background to-transparent" />
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: speed,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-lg font-medium text-muted-foreground/70"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function MarqueeStrip({
  children,
  reverse = false,
}: {
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="relative flex overflow-hidden bg-primary py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ============ DADOS DA PÁGINA ============

const FEATURES = [
  {
    icon: IconTarget,
    title: "Criação e Otimização de Anúncios",
    description:
      "Anúncios estratégicos que convertem visitantes em clientes pagantes.",
  },
  {
    icon: IconTrendingUp,
    title: "Funil de Vendas Completo",
    description:
      "Estrutura do topo ao fundo do funil para maximizar suas conversões.",
  },
  {
    icon: IconRocket,
    title: "Estratégia Orgânica",
    description:
      "Potencialize suas vendas mesmo sem investir em anúncios pagos.",
  },
  {
    icon: IconMessageCircle,
    title: "Script de Vendas Personalizado",
    description: "Roteiros prontos para você converter mais no atendimento.",
  },
  {
    icon: IconBrandWhatsapp,
    title: "Grupo Exclusivo no WhatsApp",
    description: "Suporte direto e networking com outros empreendedores.",
  },
  {
    icon: IconChartBar,
    title: "Relatórios Detalhados",
    description: "Acompanhe cada centavo investido com transparência total.",
  },
];

const RESULTS = [
  { number: 500, suffix: "+", label: "Campanhas Criadas" },
  { number: 2, suffix: "M+", label: "Em Vendas Geradas" },
  { number: 150, suffix: "+", label: "Clientes Satisfeitos" },
  { number: 300, suffix: "%", label: "Aumento Médio de ROI" },
];

const TESTIMONIALS = [
  {
    name: "Maria Silva",
    role: "Loja de Moda",
    content: "Triplicamos nossas vendas em apenas 2 meses. Resultado incrível!",
  },
  {
    name: "João Santos",
    role: "Clínica Odontológica",
    content:
      "Agenda sempre cheia graças às campanhas. Melhor investimento que fiz.",
  },
  {
    name: "Ana Costa",
    role: "E-commerce",
    content: "ROI de 400% no primeiro mês. Simplesmente extraordinário!",
  },
];

const CAROUSEL_ITEMS = [
  "🚀 Mais vendas",
  "📈 ROI garantido",
  "💰 Lucro real",
  "🎯 Tráfego qualificado",
  "📊 Métricas claras",
  "🔥 Resultados rápidos",
  "💪 Crescimento escalável",
  "✨ Estratégia vencedora",
];

const MARQUEE_ITEMS = (
  <>
    {Array(10)
      .fill(null)
      .map((_, i) => (
        <span
          key={i}
          className="flex items-center gap-8 text-primary-foreground font-semibold"
        >
          <span>TRANSFORME SEU NEGÓCIO</span>
          <span className="text-primary-foreground/50">•</span>
          <span>ESCALE SUAS VENDAS</span>
          <span className="text-primary-foreground/50">•</span>
          <span>CONQUISTE RESULTADOS</span>
          <span className="text-primary-foreground/50">•</span>
        </span>
      ))}
  </>
);

const EXTERNAL_LINK =
  "https://wa.me/5511999999999?text=Olá! Tenho interesse na gestão de tráfego.";

// ============ COMPONENTE PRINCIPAL ============

export default function GestaoDeTrafegoPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Background linears */}
        <div className="absolute inset-0 bg-linear-to-br from-chart-1/10 via-background to-chart-4/10" />
        <motion.div
          className="absolute -left-64 -top-64 h-125 w-125 rounded-full bg-chart-1/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-100 w-100 rounded-full bg-chart-4/20 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div style={{ y, opacity }} className="relative z-10">
          <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Coluna da Esquerda - Conteúdo */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
                    🔥 Vagas Limitadas
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
                >
                  Transforme cliques em{" "}
                  <span className="bg-linear-to-r from-chart-1 to-chart-4 bg-clip-text text-transparent">
                    clientes pagantes
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg text-muted-foreground md:text-xl"
                >
                  Gestão profissional de tráfego pago que gera resultados reais.
                  Escale seu negócio com estratégias comprovadas e ROI
                  garantido.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-4"
                >
                  <Button size="lg" asChild className="gap-2 text-base">
                    <a
                      href={EXTERNAL_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Quero Escalar Minhas Vendas
                      <IconArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="gap-2 text-base"
                  >
                    <a href="#sobre">Saiba Mais</a>
                  </Button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-6 pt-4"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-background bg-linear-to-br from-chart-1 to-chart-4"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">+150</span>{" "}
                    empresas já escalaram suas vendas
                  </p>
                </motion.div>
              </motion.div>

              {/* Coluna da Direita - Imagem/Ilustração */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative mx-auto aspect-square max-w-lg">
                  {/* Card flutuante principal */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="absolute inset-0 rounded-3xl bg-linear-to-br from-chart-1/80 to-chart-4/80 p-8 shadow-2xl backdrop-blur-sm"
                  >
                    <div className="flex h-full flex-col justify-between text-white">
                      <div>
                        <IconDeviceAnalytics className="mb-4 h-12 w-12" />
                        <h3 className="text-2xl font-bold">
                          Dashboard de Resultados
                        </h3>
                        <p className="mt-2 text-white/80">
                          Acompanhe suas métricas em tempo real
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Conversões</span>
                          <span className="font-bold">+247%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/20">
                          <motion.div
                            className="h-full rounded-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 1.5, delay: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Cards flutuantes secundários */}
                  <motion.div
                    animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.5,
                    }}
                    className="absolute -bottom-8 -left-8 rounded-2xl bg-card p-4 shadow-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-500/20 p-2">
                        <IconTrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          ROI Médio
                        </p>
                        <p className="text-lg font-bold">+300%</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -8, 0], x: [0, -5, 0] }}
                    transition={{
                      duration: 4.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 1,
                    }}
                    className="absolute -right-4 -top-4 rounded-2xl bg-card p-4 shadow-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-chart-1/20 p-2">
                        <IconUsers className="h-5 w-5 text-chart-1" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Leads/mês
                        </p>
                        <p className="text-lg font-bold">+1.2K</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ MARQUEE STRIP ============ */}
      <MarqueeStrip>{MARQUEE_ITEMS}</MarqueeStrip>

      {/* ============ RESULTADOS ============ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {RESULTS.map((result, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-4xl font-bold text-chart-1 md:text-5xl">
                  <AnimatedCounter end={result.number} suffix={result.suffix} />
                </div>
                <p className="mt-2 text-muted-foreground">{result.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CARROSSEL INFINITO ============ */}
      <section className="border-y bg-background py-8">
        <InfiniteCarousel items={CAROUSEL_ITEMS} />
      </section>

      {/* ============ SOBRE / O QUE ESTÁ INCLUSO ============ */}
      <section id="sobre" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="mb-4">
                O que você recebe
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              Tudo que você precisa para{" "}
              <span className="bg-linear-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                escalar suas vendas
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Uma solução completa de gestão de tráfego que cuida de tudo para
              você focar no que realmente importa: seu negócio.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-chart-1/50 group">
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-xl bg-chart-1/10 p-3 w-fit group-hover:bg-chart-1/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-chart-1" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ PLANOS ============ */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="mb-4">
                Planos
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              Escolha o plano{" "}
              <span className="bg-linear-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
                ideal para você
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Temos opções flexíveis para atender às necessidades do seu
              negócio.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
          >
            {/* Plano Trimestral */}
            <motion.div variants={itemVariants}>
              <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-linear-to-br from-chart-1/5 to-transparent" />
                <CardHeader className="relative">
                  <CardTitle className="text-2xl">Gestão Trimestral</CardTitle>
                  <CardDescription className="text-base">
                    Perfeito para começar a escalar
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">3 meses</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      de gestão profissional
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <ul className="space-y-3">
                    {[
                      "Criar e otimizar anúncios",
                      "Traçar seu funil de vendas",
                      "Estratégia para vendas no orgânico",
                      "Script de vendas personalizado",
                      "Grupo exclusivo no WhatsApp",
                      "Estruturação de ofertas",
                      "Relatórios detalhados",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <IconCheck className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" size="lg" asChild>
                    <a
                      href={EXTERNAL_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Falar com Especialista
                      <IconArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plano Semestral */}
            <motion.div variants={itemVariants}>
              <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl border-chart-1">
                <div className="absolute inset-0 bg-linear-to-br from-chart-1/10 to-chart-4/5" />
                <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-chart-1/20 blur-2xl" />
                <Badge className="absolute right-4 top-4 bg-chart-1">
                  Mais Popular
                </Badge>
                <CardHeader className="relative">
                  <CardTitle className="text-2xl">Gestão Semestral</CardTitle>
                  <CardDescription className="text-base">
                    Melhor custo-benefício
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">6 meses</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      de gestão profissional
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <ul className="space-y-3">
                    {[
                      "Tudo do plano Trimestral",
                      "Criar e otimizar anúncios",
                      "Traçar seu funil de vendas",
                      "Estratégia para vendas no orgânico",
                      "Script de vendas personalizado",
                      "Grupo exclusivo no WhatsApp",
                      "Estruturação de ofertas",
                      "Relatórios detalhados",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <IconCheck className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6 bg-chart-1 hover:bg-chart-1/90"
                    size="lg"
                    asChild
                  >
                    <a
                      href={EXTERNAL_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Falar com Especialista
                      <IconArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ DEPOIMENTOS ============ */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="mb-4">
                Depoimentos
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl"
            >
              O que nossos clientes dizem
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-500">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">
                      "{testimonial.content}"
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-chart-1 to-chart-4" />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-chart-1 to-chart-4" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-linear(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-linear(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-linear(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />

        <div className="container relative mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mx-auto max-w-3xl text-center text-white"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              Pronto para escalar seu negócio?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-white/80"
            >
              Não perca mais tempo. Fale com um especialista agora e comece a
              transformar cliques em clientes pagantes.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-base"
                asChild
              >
                <a
                  href={EXTERNAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandWhatsapp className="h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Hub LN. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a
                href="/termos-e-condicoes"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Termos e Condições
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
