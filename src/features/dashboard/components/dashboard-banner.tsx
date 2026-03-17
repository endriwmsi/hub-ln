"use client";

import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { SlideContent } from "./slide-content";

export type BannerSlide = {
  id: string;
  label?: string;
  title: string;
  description: string;
  url?: string;
  cta?: string;
  from: string;
  via?: string;
  to: string;
  icon: React.ElementType;
};

const slides: BannerSlide[] = [
  {
    id: "traffic-manager",
    label: "Parceria",
    title: "Precisa de um Gestor de Tráfego?",
    description:
      "Torne-se parceiro e tenha acesso a benefícios exclusivos, suporte dedicado e comissões diferenciadas. Impulsione seus resultados!",
    url: "/gestor",
    cta: "Saiba mais",
    from: "#8b5cf6",
    via: "#ec4899",
    to: "#f97316",
    icon: Sparkles,
  },
  {
    id: "indicacoes",
    label: "Novidade",
    title: "Indique e Ganhe Comissões",
    description:
      "Compartilhe seu código de indicação e receba comissões automáticas a cada novo parceiro que se cadastrar através de você.",
    url: "/indicacoes",
    cta: "Ver indicações",
    from: "#0ea5e9",
    via: "#6366f1",
    to: "#8b5cf6",
    icon: TrendingUp,
  },
  {
    id: "anuncio",
    label: "Aviso",
    title: "Bem-vindo à Plataforma!",
    description:
      "Explore todas as funcionalidades disponíveis: consulta de CPF/CNPJ, editor de criativos, gestão de ações e muito mais.",
    url: "/dashboard",
    cta: "Explorar",
    from: "#10b981",
    via: "#059669",
    to: "#0d9488",
    icon: Megaphone,
  },
];

const SLIDE_DURATION = 5500;

export function DashboardBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setProgressKey((k) => k + 1);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <section
      aria-label="Banner de anúncios"
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Track */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm sm:h-36">
        {slides.map((slide, i) => (
          <SlideContent
            key={slide.id}
            slide={slide}
            active={i === activeIndex}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-2 flex items-center justify-between px-1">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIndex
                  ? "h-2 w-5 bg-foreground"
                  : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo slide"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
