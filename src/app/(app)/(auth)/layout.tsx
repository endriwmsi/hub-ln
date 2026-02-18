"use client";

import Image from "next/image";
import Logo from "@/shared/components/layout/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth Form */}
      <div className="flex items-center justify-center w-full lg:w-2/5 p-6">
        <div className="flex flex-col w-full max-w-md">
          <div className="mb-10">
            <Logo className="w-48" />
          </div>

          <div>{children}</div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:flex items-center justify-center w-3/5 p-4 relative">
        <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden">
          <Image
            src="/assets/images/auth-bg.jpg"
            alt="Authentication illustration"
            fill
            className="object-cover rounded-2xl"
            priority
          />

          {/* Overlay gradient for better card visibility */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          {/* Steps cards */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Comece agora!
              </h2>
              <p className="text-white/80 text-sm">
                Siga estes passos simples para começar a usar nossa plataforma
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="bg-primary/80 backdrop-blur-md rounded-xl p-4 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <span className="text-secondary font-bold text-lg">1</span>
                </div>
                <h3 className="text-secondary font-semibold text-sm mb-1">
                  Crie sua conta
                </h3>
                <p className="text-secondary/70 text-xs">
                  Cadastre-se gratuitamente e comece a explorar
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-secondary/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  Configure seu perfil
                </h3>
                <p className="text-white/70 text-xs">
                  Personalize suas preferências e comece
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-secondary/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  Comece a usar
                </h3>
                <p className="text-white/70 text-xs">
                  Acesse todas as funcionalidades disponíveis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
