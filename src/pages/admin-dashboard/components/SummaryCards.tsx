import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardsProps {
  clientSummary: {
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
    fullyOnboarded: number;
  };
  pendingInvoices: number;
  overdueInvoices: number;
}

export const SummaryCards = ({ clientSummary, pendingInvoices, overdueInvoices }: SummaryCardsProps) => (
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">Total clients</p>
        <CardTitle className="text-3xl font-bold">{clientSummary.totalClients}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>New this month</span>
          <Badge variant="secondary">{clientSummary.newThisMonth}</Badge>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">Active clients</p>
        <CardTitle className="text-3xl font-bold">{clientSummary.activeClients}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Engaged and live contracts</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">Fully onboarded</p>
        <CardTitle className="text-3xl font-bold">{clientSummary.fullyOnboarded}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Welcome + payment recorded</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">Pending invoices</p>
        <CardTitle className="text-3xl font-bold">{pendingInvoices}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{overdueInvoices} overdue</Badge>
          <span>Invoice sent but not paid</span>
        </div>
      </CardContent>
    </Card>
  </section>
);

