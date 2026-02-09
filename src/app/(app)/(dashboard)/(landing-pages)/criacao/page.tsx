/** biome-ignore-all lint/suspicious/noArrayIndexKey: supress use of the index rule. */

"use client";

import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconCode,
  IconDeviceMobile,
  IconPalette,
  IconRocket,
  IconSearch,
  IconServer,
  IconSparkles,
  IconWorld,
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
    <div className="relative flex overflow-hidden bg-linear-to-r from-chart-2 to-chart-3 py-3">
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

function FloatingIcon({
  Icon,
  delay = 0,
  className = "",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay }}
      className={`rounded-2xl bg-card p-3 shadow-lg border ${className}`}
    >
      <Icon className="h-6 w-6 text-chart-2" />
    </motion.div>
  );
}

// ============ DADOS DA PÁGINA ============

const FEATURES = [
  {
    icon: IconPalette,
    title: "Design Exclusivo",
    description:
      "Layouts personalizados e únicos para destacar sua marca no mercado.",
  },
  {
    icon: IconDeviceMobile,
    title: "100% Responsivo",
    description:
      "Seu site perfeito em qualquer dispositivo: celular, tablet ou desktop.",
  },
  {
    icon: IconRocket,
    title: "Alta Performance",
    description: "Sites otimizados para carregar em menos de 3 segundos.",
  },
  {
    icon: IconSearch,
    title: "SEO Otimizado",
    description:
      "Estrutura preparada para ranquear no Google e atrair tráfego orgânico.",
  },
  {
    icon: IconServer,
    title: "Hospedagem Inclusa",
    description: "1 ano de hospedagem e domínio inclusos em todos os planos.",
  },
  {
    icon: IconCode,
    title: "Código Limpo",
    description:
      "Desenvolvimento com as melhores práticas e tecnologias atuais.",
  },
];

const RESULTS = [
  { number: 200, suffix: "+", label: "Sites Entregues" },
  { number: 98, suffix: "%", label: "Clientes Satisfeitos" },
  { number: 50, suffix: "+", label: "Landing Pages" },
  { number: 15, suffix: " dias", label: "Prazo Médio" },
];

const PRICING_PLANS = [
  {
    name: "Landing Page",
    description: "Perfeito para captura de leads e campanhas",
    price: "1.497",
    originalPrice: "2.497",
    features: [
      "1 página completa",
      "Design personalizado",
      "Formulário de contato",
      "Otimização para SEO",
      "Responsivo para mobile",
      "Integração com WhatsApp",
      "1 ano de hospedagem",
      "Suporte por 30 dias",
    ],
    highlighted: false,
    badge: null,
  },
  {
    name: "Site Institucional",
    description: "Ideal para empresas que querem presença online",
    price: "2.997",
    originalPrice: "4.497",
    features: [
      "Até 5 páginas",
      "Design exclusivo",
      "Formulário de contato",
      "Otimização avançada SEO",
      "Responsivo para mobile",
      "Integração com WhatsApp",
      "Integração com redes sociais",
      "1 ano de hospedagem",
      "1 ano de domínio",
      "Suporte por 60 dias",
    ],
    highlighted: true,
    badge: "Mais Vendido",
  },
  {
    name: "E-commerce",
    description: "Para quem quer vender online sem limites",
    price: "4.997",
    originalPrice: "7.997",
    features: [
      "Loja virtual completa",
      "Cadastro ilimitado de produtos",
      "Carrinho de compras",
      "Checkout integrado",
      "Múltiplas formas de pagamento",
      "Gestão de estoque",
      "Painel administrativo",
      "Design personalizado",
      "1 ano de hospedagem",
      "1 ano de domínio",
      "Suporte por 90 dias",
    ],
    highlighted: false,
    badge: "Completo",
  },
];

const TESTIMONIALS = [
  {
    name: "Carlos Oliveira",
    role: "Advogado",
    content:
      "Meu site ficou incrível! Já recebi 3x mais contatos do que antes.",
  },
  {
    name: "Fernanda Lima",
    role: "Nutricionista",
    content:
      "Profissionais e rápidos. Entregaram antes do prazo e superaram expectativas.",
  },
  {
    name: "Ricardo Mendes",
    role: "E-commerce",
    content:
      "Minha loja virtual está vendendo todos os dias. Investimento que valeu cada centavo!",
  },
];

const CAROUSEL_ITEMS = [
  "💻 Sites modernos",
  "🎨 Design exclusivo",
  "📱 100% responsivo",
  "🚀 Alta performance",
  "🔍 SEO otimizado",
  "🛒 E-commerce",
  "📄 Landing pages",
  "✨ Experiência única",
];

const MARQUEE_ITEMS = (
  <>
    {Array(10)
      .fill(null)
      .map((_, i) => (
        <span
          key={i}
          className="flex items-center gap-8 text-white font-semibold"
        >
          <span>SITES PROFISSIONAIS</span>
          <span className="text-white/50">•</span>
          <span>DESIGN ÚNICO</span>
          <span className="text-white/50">•</span>
          <span>RESULTADOS REAIS</span>
          <span className="text-white/50">•</span>
        </span>
      ))}
  </>
);

const EXTERNAL_LINK =
  "https://wa.me/5511999999999?text=Olá! Tenho interesse em criar um site.";

// ============ COMPONENTE PRINCIPAL ============

export default function CriacaoDeSitePage() {
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
        <div className="absolute inset-0 bg-linear-to-br from-chart-2/10 via-background to-chart-3/10" />
        <motion.div
          className="absolute -left-64 -top-64 h-125 w-125 rounded-full bg-chart-2/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-100 w-100 rounded-full bg-chart-3/20 blur-3xl"
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
                    ✨ Design que Converte
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
                >
                  Seu negócio merece um{" "}
                  <span className="bg-linear-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
                    site profissional
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg text-muted-foreground md:text-xl"
                >
                  Criamos sites e landing pages que impressionam, convertem
                  visitantes em clientes e fazem seu negócio crescer no digital.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-4"
                >
                  <Button
                    size="lg"
                    asChild
                    className="gap-2 text-base bg-linear-to-r from-chart-2 to-chart-3 hover:opacity-90"
                  >
                    <a href="#precos">
                      Ver Planos e Preços
                      <IconArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="gap-2 text-base"
                  >
                    <a href="#portfolio">Ver Portfólio</a>
                  </Button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-6 pt-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-background bg-linear-to-br from-chart-2 to-chart-3"
                        />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-500 text-sm">
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +200 clientes satisfeitos
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Coluna da Direita - Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative mx-auto aspect-square max-w-lg">
                  {/* Browser mockup */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="absolute inset-0 rounded-2xl bg-card border shadow-2xl overflow-hidden"
                  >
                    {/* Browser header */}
                    <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-6 rounded-md bg-muted flex items-center px-3">
                          <IconWorld className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                          <span className="text-xs text-muted-foreground">
                            seunegocio.com.br
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Browser content */}
                    <div className="p-6 space-y-4">
                      <div className="h-32 rounded-xl bg-linear-to-br from-chart-2/20 to-chart-3/20" />
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-4 w-1/2 rounded bg-muted" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-lg bg-muted/50" />
                        <div className="h-20 rounded-lg bg-muted/50" />
                        <div className="h-20 rounded-lg bg-muted/50" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating icons */}
                  <FloatingIcon
                    Icon={IconPalette}
                    delay={0}
                    className="absolute -left-6 top-20"
                  />
                  <FloatingIcon
                    Icon={IconCode}
                    delay={0.5}
                    className="absolute -right-4 top-32"
                  />
                  <FloatingIcon
                    Icon={IconDeviceMobile}
                    delay={1}
                    className="absolute -bottom-4 left-20"
                  />
                  <FloatingIcon
                    Icon={IconSparkles}
                    delay={1.5}
                    className="absolute -right-8 bottom-20"
                  />
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
                <div className="text-4xl font-bold text-chart-2 md:text-5xl">
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

      {/* ============ SOBRE / O QUE OFERECEMOS ============ */}
      <section id="portfolio" className="py-20 lg:py-32">
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
                Nossos Diferenciais
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              Por que escolher a{" "}
              <span className="bg-linear-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
                nossa equipe?
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Entregamos muito mais do que um site. Entregamos uma ferramenta de
              crescimento para o seu negócio.
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
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-chart-2/50 group">
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-xl bg-linear-to-br from-chart-2/10 to-chart-3/10 p-3 w-fit group-hover:from-chart-2/20 group-hover:to-chart-3/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-chart-2" />
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

      {/* ============ PREÇOS ============ */}
      <section id="precos" className="py-20 lg:py-32 bg-muted/30">
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
                Investimento
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              Planos que cabem no{" "}
              <span className="bg-linear-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
                seu bolso
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Escolha o plano ideal para o momento do seu negócio. Todos incluem
              hospedagem e domínio por 1 ano.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {PRICING_PLANS.map((plan, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={`relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.highlighted
                      ? "border-chart-2 shadow-lg shadow-chart-2/10"
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute inset-0 bg-linear-to-br from-chart-2/5 to-chart-3/5" />
                  )}
                  {plan.badge && (
                    <Badge
                      className={`absolute right-4 top-4 ${
                        plan.highlighted
                          ? "bg-linear-to-r from-chart-2 to-chart-3"
                          : "bg-chart-3"
                      }`}
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  <CardHeader className="relative pb-0">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {plan.originalPrice}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">
                          R$
                        </span>
                        <span className="text-5xl font-bold">{plan.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        ou em até 12x no cartão
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-6 space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <IconCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        plan.highlighted
                          ? "bg-linear-to-r from-chart-2 to-chart-3 hover:opacity-90"
                          : ""
                      }`}
                      size="lg"
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <a
                        href={EXTERNAL_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Quero Este Plano
                        <IconArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            * Valores promocionais por tempo limitado. Condições especiais para
            pagamento à vista.
          </motion.p>
        </div>
      </section>

      {/* ============ PROCESSO ============ */}
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
                Como Funciona
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl"
            >
              Do zero ao site no ar em{" "}
              <span className="bg-linear-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
                4 passos simples
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                step: "01",
                title: "Briefing",
                description:
                  "Entendemos suas necessidades, objetivos e identidade visual.",
              },
              {
                step: "02",
                title: "Design",
                description:
                  "Criamos um layout exclusivo e enviamos para sua aprovação.",
              },
              {
                step: "03",
                title: "Desenvolvimento",
                description:
                  "Transformamos o design em código, com alta performance.",
              },
              {
                step: "04",
                title: "Entrega",
                description:
                  "Site no ar, otimizado e pronto para receber seus clientes.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-chart-2 to-chart-3 text-2xl font-bold text-white">
                  {item.step}
                </div>
                {index < 3 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-linear-to-r from-chart-2/50 to-transparent lg:block" />
                )}
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ DEPOIMENTOS ============ */}
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
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-chart-2 to-chart-3" />
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

      {/* ============ FAQ ============ */}
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
                Dúvidas Frequentes
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold md:text-4xl"
            >
              Perguntas frequentes
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mt-12 mx-auto max-w-3xl space-y-4"
          >
            {[
              {
                question: "Quanto tempo leva para ficar pronto?",
                answer:
                  "O prazo médio é de 10 a 15 dias úteis, dependendo da complexidade do projeto e agilidade no envio dos materiais.",
              },
              {
                question: "O que preciso fornecer?",
                answer:
                  "Textos, fotos, logo em alta qualidade, cores da marca (se houver) e referências de sites que você gosta.",
              },
              {
                question: "Posso alterar o site depois de pronto?",
                answer:
                  "Sim! Você receberá acesso ao painel administrativo para fazer alterações simples. Para mudanças estruturais, oferecemos suporte.",
              },
              {
                question: "O site fica no meu nome?",
                answer:
                  "Sim, o domínio e a hospedagem são registrados no seu nome. Você é o proprietário total do site.",
              },
              {
                question: "Vocês fazem manutenção?",
                answer:
                  "Oferecemos planos de manutenção mensal para atualizações, backups e suporte técnico contínuo.",
              },
            ].map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-chart-2 to-chart-3" />
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
              Pronto para ter seu site profissional?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-white/80"
            >
              Não perca mais vendas por não ter presença online. Fale conosco
              agora e transforme seu negócio.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
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
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base bg-transparent border-white text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href="#precos">Ver Planos</a>
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
