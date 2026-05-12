import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewMetricsCardProps {
  clientSummary: {
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
    fullyOnboarded: number;
  };
  collected: string;
  outstanding: string;
}

export const OverviewMetricsCard = ({ clientSummary, collected, outstanding }: OverviewMetricsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Key metrics at a glance</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Total Clients */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total clients</p>
            <p className="text-3xl font-bold">{clientSummary.totalClients}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">New this month</span>
              <Badge variant="secondary" className="text-xs">
                {clientSummary.newThisMonth}
              </Badge>
            </div>
          </div>

          {/* Active Clients */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active clients</p>
            <p className="text-3xl font-bold">{clientSummary.activeClients}</p>
            <p className="text-xs text-muted-foreground pt-1">Engaged and live contracts</p>
          </div>

          {/* Fully Onboarded */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fully onboarded</p>
            <p className="text-3xl font-bold">{clientSummary.fullyOnboarded}</p>
            <p className="text-xs text-muted-foreground pt-1">Welcome + payment recorded</p>
          </div>

          {/* Collected */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-3xl font-bold text-green-400">{collected}</p>
            <p className="text-xs text-muted-foreground pt-1">Payment received</p>
          </div>

          {/* Outstanding */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-3xl font-bold text-orange-400">{outstanding}</p>
            <p className="text-xs text-muted-foreground pt-1">Invoice sent but unpaid</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

