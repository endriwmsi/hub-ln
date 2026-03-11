import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session?.user;

  // Rotas públicas/de autenticação
  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Se usuário está logado e tenta acessar rotas de auth → redirecionar para dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Rotas protegidas (dashboard)
  const protectedRoutes = [
    "/dashboard",
    "/criativos",
    "/editor",
    "/envios",
    "/indicacoes",
    "/servicos",
    "/transacoes",
    "/configuracoes",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Se usuário está logado, verificar se a conta foi aprovada
  if (isAuthenticated && session?.user?.email) {
    const userData = await db.query.user.findFirst({
      where: eq(user.email, session.user.email),
    });

    // Se usuário não foi aprovado, fazer logout
    if (userData && !userData.approved) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      // Limpar cookies de sessão
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("better-auth.session");
      return response;
    }
  }

  // Se usuário NÃO está logado e tenta acessar rotas protegidas → redirecionar para login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Adiciona redirect query param para retornar após login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecionar root para dashboard se logado, senão para landing page
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
