import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const pricingPlans = [
  {
    name: "Starter",
    price: "$1,500",
    period: "/month",
    description: "Perfect for small businesses getting started with digital marketing.",
    features: [
      "Social media management (2 platforms)",
      "4 content pieces per month",
      "Basic analytics reporting",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$3,500",
    period: "/month",
    description: "Ideal for growing brands ready to scale their presence.",
    features: [
      "Social media management (4 platforms)",
      "12 content pieces per month",
      "Lead generation funnel setup",
      "Monthly strategy calls",
      "Advanced analytics dashboard",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Full-service solution for established businesses.",
    features: [
      "Unlimited platform management",
      "Custom content production",
      "Ad campaign management",
      "Dedicated account manager",
      "24/7 priority support",
      "Quarterly business reviews",
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
