import { eq } from "drizzle-orm/sql/expressions/conditions";
import { verifySession } from "@/core";
import { db } from "@/core/db";
import { user } from "@/core/db/schema/user.schema";
import { UpdatePixKeyForm } from "@/features/settings/components/update-pix-key-form";

const KeysPage = async () => {
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
        <h1 className="text-3xl font-bold">Chaves</h1>
        <p className="text-muted-foreground">
          Gerencie suas chaves de API e outras configurações.
        </p>
      </div>

      <UpdatePixKeyForm defaultValues={{ key: userData.pixKey }} />
    </div>
  );
};

export default KeysPage;
