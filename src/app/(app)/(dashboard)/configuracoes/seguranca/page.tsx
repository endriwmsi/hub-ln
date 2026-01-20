import { UpdatePasswordForm } from "@/features/settings/components/update-password-form";

const SecurityPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Segurança</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de segurança
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  );
};

export default SecurityPage;
