import { Pencil, Share2, Target, Megaphone, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Pencil,
    title: "Content Creation",
    description: "High-quality, engaging content that captures your brand's voice and resonates with your audience across all platforms.",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description: "Comprehensive social media strategy and management to build your online presence and engage your community.",
  },
  {
    icon: Target,
    title: "Lead Generation & Funnel Creation",
    description: "Strategic lead generation systems and optimized sales funnels designed to convert prospects into customers.",
  },
  {
    icon: Megaphone,
    title: "Ad Campaign Management",
    description: "Data-driven advertising campaigns across multiple platforms to maximize ROI and reach your target audience.",
  },
  {
    icon: Settings,
    title: "Tailored Systems & Strategy",
    description: "Custom solutions and strategic frameworks specifically designed to help you achieve your unique business goals.",
  },
];

const Services = () => {
  return (
    <section id="services" className="w-full py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive media solutions designed to elevate your brand and drive measurable results.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <service.icon className="w-8 h-8" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
