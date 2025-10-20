import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "TOTAL VIEWS", value: "23,113", growth: "↑ 307% vs last month" },
  { label: "INTERACTIONS", value: "676", growth: "↑ 583% vs last month" },
  { label: "NEW FOLLOWERS", value: "46", growth: "↑ 19.8% vs last month" },
  { label: "LEADS GENERATED", value: "62", growth: "↑ 82% vs last month" },
];

const platformStats = [
  { label: "Followers", value: "278" },
  { label: "Accounts Reached", value: "6,766" },
  { label: "Reach to View %", value: "29%" },
];

const Performance = () => {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Performance That Speaks</h2>
          <p className="text-muted-foreground text-lg">
            Overall, really good month of growth. We saw significant increase in every category, especially interactions. Going into next month we focus on educational content with entertainment second.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <Card key={index} className="border border-border">
              <CardContent className="p-6 space-y-3">
                <p className="text-xs text-muted-foreground font-medium tracking-wide">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-success font-medium">{metric.growth}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-8">Platform Performance</h3>
          <Card className="border border-border">
            <CardContent className="p-8">
              <p className="text-sm font-semibold mb-6 tracking-wide">INSTAGRAM</p>
              <div className="grid sm:grid-cols-3 gap-8">
                {platformStats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-3xl font-bold mb-2">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Performance;
