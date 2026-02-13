import { requireAdmin } from "@/core";
import { ServicesTableContainer } from "@/features/services";

export default async function AdminServicosPage() {
  await requireAdmin();

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <ServicesTableContainer />
    </div>
  );
}
