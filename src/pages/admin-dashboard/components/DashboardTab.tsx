import { OverviewMetricsCard } from "./OverviewMetricsCard";
import { OnboardingPipelineSection } from "./OnboardingPipelineSection";
import { BillingHealthSection } from "./BillingHealthSection";
import { ActivityFeedCard } from "./ActivityFeedCard";
import type { Client } from "../types";
import type { useAdminMetrics } from "../use-admin-metrics";

interface DashboardTabProps {
  clientSummary: ReturnType<typeof useAdminMetrics>["clientSummary"];
  billingStats: ReturnType<typeof useAdminMetrics>["billingStats"];
  onboardingFunnel: ReturnType<typeof useAdminMetrics>["onboardingFunnel"];
  slowOnboardings: ReturnType<typeof useAdminMetrics>["slowOnboardings"];
  pipelineStats: ReturnType<typeof useAdminMetrics>["pipelineStats"];
  atRiskClients: ReturnType<typeof useAdminMetrics>["atRiskClients"];
  activityFeed: ReturnType<typeof useAdminMetrics>["activityFeed"];
  clients: Client[];
}

export const DashboardTab = ({
  clientSummary,
  billingStats,
  onboardingFunnel,
  slowOnboardings,
  pipelineStats,
  atRiskClients,
  activityFeed,
  clients,
}: DashboardTabProps) => {
  return (
    <div className="space-y-8">
      <OverviewMetricsCard
        clientSummary={clientSummary}
        collected={billingStats.formattedCollected}
        outstanding={billingStats.formattedOutstanding}
      />

      <OnboardingPipelineSection
        onboardingFunnel={onboardingFunnel}
        slowOnboardings={slowOnboardings}
        pipelineStats={pipelineStats}
      />

      <BillingHealthSection
        billingStats={{
          invoicesSent: billingStats.invoicesSent,
          invoicesPaid: billingStats.invoicesPaid,
          pendingInvoices: billingStats.pendingInvoices,
          overdueInvoices: billingStats.overdueInvoices,
        }}
        clients={clients}
        atRiskClients={atRiskClients}
      />

      <ActivityFeedCard activityFeed={activityFeed} />
    </div>
  );
};

