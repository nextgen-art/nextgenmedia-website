import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

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
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="w-full py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className={`max-w-3xl mb-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Performance That Speaks</h2>
          <p className="text-muted-foreground text-lg">
            This reflects one of our client's first month partnering with us. Our content strategy produced impressive growth across the board, particularly in interactions. The numbers speak to our proficiency in optimizing social media performance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className={`border border-border ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-3 text-center">
                <p className="text-xs text-muted-foreground font-medium tracking-wide">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-success font-medium">{metric.growth}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className={`flex flex-col items-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <h3 className="text-2xl font-bold mb-6">Platform Performance</h3>
          <Card className="border border-border max-w-2xl w-full">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3 tracking-wide text-center">INSTAGRAM</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {platformStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
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
