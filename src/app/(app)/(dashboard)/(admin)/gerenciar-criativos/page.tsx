import { requireAdmin } from "@/core";
import { ManageCreativesContainer } from "@/features/creatives";

export default async function AdminCriativosPage() {
  await requireAdmin();

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <ManageCreativesContainer />
    </div>
  );
}
