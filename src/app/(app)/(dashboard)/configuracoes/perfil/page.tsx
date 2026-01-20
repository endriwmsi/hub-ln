import { eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { UpdateProfileForm } from "@/features/settings/components/update-profile-form";

const ProfilePage = async () => {
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
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      <UpdateProfileForm
        defaultValues={{
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
        }}
      />

      {/* <UpdateEmailForm
        defaultValues={{
          email: userData.email,
        }}
      />

      <UpdatePhoneForm
        defaultValues={{
          phone: userData.phone || "",
        }}
      /> */}
    </div>
  );
};

export default ProfilePage;
