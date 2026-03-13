import { Lock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/shared/components/layout/logo";
import { ConsultaForm } from "./consulta-form";

export const metadata: Metadata = {
  title: "Hub LN - Consultar Processo",
  description:
    "Consulte o status do seu processo de limpeza de nome. Informe seu CPF ou CNPJ para verificar o andamento das baixas por órgão.",
};

export default function ConsultaPublicaPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-40 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/10 blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-2xl space-y-10 sm:space-y-12">
          {/* Header with logo */}
          <header className="flex justify-center pt-4 sm:pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-lg shadow-black/5">
              <div className="h-1.5 w-1.5 rounded-full" />
              <Logo className="h-6 w-auto" />
            </div>
          </header>

          {/* Hero Section */}
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-top-8 duration-700 delay-100">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-linear-to-r from-blue-50 to-cyan-50 px-4 py-2 shadow-md shadow-blue-200/20 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                Consulta gratuita e segura
              </span>
            </div>

            <div className="space-y-8 mb-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-slate-900">
                  Consulte o status do seu{" "}
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                    processo!
                  </span>
                </span>
              </h1>

              <p className="mx-auto max-w-md text-base text-slate-600 sm:text-lg leading-relaxed">
                Informe seu CPF ou CNPJ para verificar o status das baixas nos
                órgãos de proteção ao crédito.
              </p>
            </div>
          </div>

          {/* Search card with enhanced styling */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="group rounded-3xl border border-white/60 bg-linear-to-b from-white/95 to-white/80 p-8 sm:p-10 shadow-2xl shadow-blue-200/20 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-300/30 hover:border-white/80">
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-blue-600/5 to-indigo-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <ConsultaForm />
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="space-y-3 text-center animate-in fade-in duration-700 delay-300 mt-4">
            <div className="inline-flex flex-col gap-2 rounded-full bg-white/40 px-5 py-3 backdrop-blur-sm border border-white/60 shadow-lg shadow-black/5">
              <div className="flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">
                  Seus dados são tratados com segurança e privacidade.
                </span>
              </div>
              <span className="text-xs text-slate-600/80">
                Em caso de dúvidas, entre em contato com o responsável pelo seu
                processo.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
