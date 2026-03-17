import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BannerSlide } from "./dashboard-banner";

export function SlideContent({
  slide,
  active,
}: {
  slide: BannerSlide;
  active: boolean;
}) {
  const Icon = slide.icon;
  const gradient = slide.via
    ? `linear-gradient(135deg, ${slide.from}, ${slide.via}, ${slide.to})`
    : `linear-gradient(135deg, ${slide.from}, ${slide.to})`;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center overflow-hidden rounded-xl transition-opacity duration-500",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      {/* Background tint */}
      <div
        className="absolute inset-0 rounded-xl opacity-[0.07] dark:opacity-[0.14]"
        style={{ background: gradient }}
      />

      {/* Gradient border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-60"
        style={{
          background: gradient,
          padding: "1.5px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Glow blob top-right */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-10 blur-3xl"
        style={{ background: slide.from }}
      />

      {/* Dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern
            id={`dots-${slide.id}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#dots-${slide.id})`} />
        </svg>
      </div>

      {/* Main content row */}
      <div className="relative z-10 flex w-full items-center gap-5 px-6 py-7 sm:gap-6 sm:px-8">
        {/* Icon badge — hidden on mobile */}
        <div
          className="hidden shrink-0 items-center justify-center rounded-2xl border border-white/20 sm:flex"
          style={{
            background: `${slide.from}22`,
            width: 64,
            height: 64,
          }}
        >
          <Icon className="h-7 w-7" style={{ color: slide.from }} />
        </div>

        {/* Text block */}
        <div className="min-w-0 flex-1 space-y-2">
          {slide.label && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white"
              style={{ background: gradient }}
            >
              {slide.label}
            </span>
          )}

          <h2 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
            {slide.title}
          </h2>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {slide.description}
          </p>
        </div>

        {/* CTA — plain Link, no motion wrapper */}
        {slide.url && slide.cta && (
          <div className="shrink-0">
            <Link
              href={slide.url}
              className="group flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] hover:brightness-110 active:scale-[0.97]"
              style={{
                background: gradient,
                boxShadow: `0 4px 20px -6px ${slide.from}66`,
              }}
            >
              {slide.cta}
              <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
