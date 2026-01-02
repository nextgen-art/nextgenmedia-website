import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { formatDate } from "../utils";

interface OnboardingPipelineSectionProps {
  onboardingFunnel: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  slowOnboardings: { client: Client; days: number }[];
  pipelineStats: {
    proposalsPending: number;
    proposalsAccepted: number;
    contractsPendingSignature: number;
    contractsSigned: number;
  };
}

export const OnboardingPipelineSection = ({
  onboardingFunnel,
  slowOnboardings,
  pipelineStats,
}: OnboardingPipelineSectionProps) => (
  <section className="grid gap-6 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Onboarding</CardTitle>
        <p className="text-sm text-muted-foreground">
          Progress based on existing onboarding/payment dates
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Not started</p>
            <p className="text-2xl font-semibold">{onboardingFunnel.notStarted}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">In progress</p>
            <p className="text-2xl font-semibold">{onboardingFunnel.inProgress}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-semibold">{onboardingFunnel.completed}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Slowest onboardings</p>
          {slowOnboardings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No in-progress onboardings.</p>
          ) : (
            <div className="space-y-2">
              {slowOnboardings.map(({ client, days }) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {client.client_name || client.client_email || client.client_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Started: {formatDate(client.onboarding_started_date)}
                    </p>
                  </div>
                  <Badge variant="secondary">{days}d</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Uses existing status and proposal/contract dates
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Proposals pending</p>
            <p className="text-2xl font-semibold">{pipelineStats.proposalsPending}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Proposals accepted</p>
            <p className="text-2xl font-semibold">{pipelineStats.proposalsAccepted}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Contracts pending signature</p>
            <p className="text-2xl font-semibold">{pipelineStats.contractsPendingSignature}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
);

