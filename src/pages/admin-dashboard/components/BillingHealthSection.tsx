import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { formatDate, isInvoiceOverdue } from "../utils";

interface BillingHealthSectionProps {
  billingStats: {
    invoicesSent: number;
    invoicesPaid: number;
    pendingInvoices: number;
    overdueInvoices: number;
  };
  clients: Client[];
  atRiskClients: { client: Client; reason: string }[];
}

export const BillingHealthSection = ({
  billingStats,
  clients,
  atRiskClients,
}: BillingHealthSectionProps) => (
  <section className="grid gap-6 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <p className="text-sm text-muted-foreground">
          Derived from invoice_sent_date and payment_received_date
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Invoices sent</p>
            <p className="text-2xl font-semibold">{billingStats.invoicesSent}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Invoices paid</p>
            <p className="text-2xl font-semibold">{billingStats.invoicesPaid}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold">{billingStats.pendingInvoices}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Overdue (&gt;14d)</p>
            <p className="text-2xl font-semibold">{billingStats.overdueInvoices}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Overdue list</p>
          {clients.filter((client) => isInvoiceOverdue(client)).length === 0 ? (
            <p className="text-sm text-muted-foreground">No overdue invoices.</p>
          ) : (
            <div className="space-y-2">
              {clients
                .filter((client) => isInvoiceOverdue(client))
                .slice(0, 5)
                .map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {client.client_name || client.client_email || client.client_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sent {formatDate(client.invoice_sent_date)}
                      </p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Health</CardTitle>
        <p className="text-sm text-muted-foreground">
          Highlights risky clients using existing fields only
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {atRiskClients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No at-risk clients detected.</p>
        ) : (
          <div className="space-y-2">
            {atRiskClients.map(({ client, reason }) => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {client.client_name || client.client_email || client.client_id}
                  </p>
                  <p className="text-sm text-muted-foreground">{reason}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  At risk
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </section>
);

