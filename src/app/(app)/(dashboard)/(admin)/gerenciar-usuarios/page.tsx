import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { requireAdmin } from "@/core/auth/dal";
import { UsersTableContainer } from "@/features/users/components/users-table-container";

export default async function UsuariosPage() {
  await requireAdmin();

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <UsersTableContainer />
      </Suspense>
    </div>
  );
}
