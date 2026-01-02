import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueCardsProps {
  collected: string;
  outstanding: string;
}

export const RevenueCards = ({ collected, outstanding }: RevenueCardsProps) => (
  <section className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">Collected</p>
        <CardTitle className="text-3xl font-bold">{collected}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Payment received dates recorded in clients
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">Outstanding</p>
        <CardTitle className="text-3xl font-bold">{outstanding}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Invoice sent but unpaid; derived from existing invoice/payment dates
      </CardContent>
    </Card>
  </section>
);

