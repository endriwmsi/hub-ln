import { SubscriptionGuard } from "@/features/subscriptions/components/subscription-guard";

const DashboardPage = () => {
  return (
    <SubscriptionGuard>
      <div>Welcome to the Dashboard!</div>
    </SubscriptionGuard>
  );
};

export default DashboardPage;
