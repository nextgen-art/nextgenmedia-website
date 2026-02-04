import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const pricingPlans = [
  {
    name: "Starter",
    price: "$2,000",
    period: "/month",
    description: "Perfect for small businesses getting started with content creation.",
    features: [
      "1 monthly content shoot",
      "20–25 edited assets total",
      "15–18 edited photos (ready-to-post)",
      "3–5 edited short-form videos",
      "Single platform optimization (IG, Facebook, TikTok, etc.)",
      "Monthly content calendar (posting guidance)",
      "Premium assets delivered monthly",
      "No revisions",
    ],
  },
  {
    name: "Growth",
    price: "$3,500",
    period: "/month",
    description: "Ideal for growing brands ready to scale their presence.",
    features: [
      "Bi-weekly content shoots (2 per month)",
      "40–50 total edited assets per month",
      "30 edited photos",
      "10–15 edited short-form videos",
      "Multi-platform optimized delivery (Instagram + Facebook)",
      "Monthly content strategy session",
      "Full caption writing with CTAs",
      "Hashtag research & targeting",
      "Content calendar + Posting",
      "Monthly performance insights",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "$5,000",
    period: "/month",
    description: "Comprehensive solution for brands seeking maximum growth and engagement.",
    features: [
      "Weekly content shoots (4 per month)",
      "60+ total edited assets per month",
      "45 edited photos",
      "15 edited short-form videos",
      "Multi-platform optimized delivery",
      "Full posting & scheduling across 3 platforms",
      "Daily story creation and posting",
      "Caption writing with CTAs",
      "Hashtag research and targeting",
      "DM monitoring and response",
      "Active community engagement",
      "Ad campaign creation and management",
      "Weekly strategy calls",
      "Advanced performance reports with actionable insights",
      "Ongoing optimization based on performance data",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: " Pricing",
    description: "Tailored solutions for multi-location businesses and large-scale operations.",
    features: [
      "Custom photos and videos tailored to your brand",
      "Custom content creation schedule",
      "Multi-location content strategies",
      "Brand consistency across all locations",
      "Location-specific campaigns for local impact",
      "Management across multiple social platforms",
      "Dedicated account manager",
      "24/7 priority support",
      "Revenue initiative meetings",
      "Ongoing optimization based on ROI metrics",
    ],
  },
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" ref={ref as React.RefObject<HTMLElement>} className="w-full py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className={`max-w-2xl mb-16 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Transparent pricing tailored to your business needs. Choose the plan that fits your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`border border-border hover:shadow-lg transition-all relative ${
                plan.popular ? 'ring-2 ring-primary' : ''
              } ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild 
                  className="w-full rounded-full mt-6" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  <a href="#contact">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
