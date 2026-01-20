import { eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { DocumentsDisplay } from "@/features/settings/components/documents-display";

const DocumentsPage = async () => {
  const { userId } = await verifySession();

  const userData = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!userData) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">
          Visualize seus documentos cadastrados
        </p>
      </div>

      <DocumentsDisplay cpf={userData.cpf} cnpj={userData.cnpj} />
    </div>
  );
};

export default DocumentsPage;
