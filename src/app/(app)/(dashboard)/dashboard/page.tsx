import { SubscriptionGuard } from "@/features/subscriptions/components/subscription-guard";

const DashboardPage = () => {
  return (
    <SubscriptionGuard>
      <div className="space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
        Welcome to the Dashboard!
      </div>
    </SubscriptionGuard>
  );
};

export default DashboardPage;
