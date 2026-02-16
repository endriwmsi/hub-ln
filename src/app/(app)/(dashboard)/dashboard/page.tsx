import { getDashboardMetrics } from "@/features/dashboard/actions/get-dashboard-metrics";
import { getTopPartners } from "@/features/dashboard/actions/get-top-partners";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { ResponsiveDashboardUtils } from "@/features/dashboard/components/responsive-dashboard-utils";

export default async function DashboardPage() {
  const [metrics, topPartners] = await Promise.all([
    getDashboardMetrics(),
    getTopPartners(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex-1">
          <DashboardStats metrics={metrics} />
        </div>

        <ResponsiveDashboardUtils topPartners={topPartners} />
      </div>
    </div>
  );
}
