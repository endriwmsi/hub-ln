import { eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { UpdateAddressForm } from "@/features/settings/components/update-address-form";

const AddressPage = async () => {
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
        <h1 className="text-3xl font-bold">Endereço</h1>
        <p className="text-muted-foreground">
          Atualize suas informações de endereço
        </p>
      </div>

      <UpdateAddressForm
        defaultValues={{
          street: userData.street,
          number: userData.number,
          complement: userData.complement,
          neighborhood: userData.neighborhood,
          city: userData.city,
          uf: userData.uf,
          cep: userData.cep,
        }}
      />
    </div>
  );
};

export default AddressPage;
