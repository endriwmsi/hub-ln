import { Send } from "lucide-react";
import { getServices } from "@/features/services";
import { SubmissionsContainer } from "@/features/submissions";

export default async function EnviosPage() {
  // Buscar serviços para o filtro
  const services = await getServices();

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Send className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Envios</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das suas solicitações de serviço
          </p>
        </div>
      </div>

      <SubmissionsContainer services={services} />
    </div>
  );
}
