import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { requireAdmin } from "@/core/auth/dal";
import { AcoesTableContainer } from "@/features/acoes/components/acoes-table-container";

export default async function AcoesPage() {
  await requireAdmin();

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ações Limpa Nome</h1>
        <p className="text-muted-foreground">
          Gerencie todas as ações de limpeza de nome da plataforma
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <AcoesTableContainer />
      </Suspense>
    </div>
  );
}
