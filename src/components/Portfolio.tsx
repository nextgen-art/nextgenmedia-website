import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    category: "Digital Marketing",
    title: "Brand Campaign",
    metric: "+583% Interactions",
    metricColor: "text-success",
  },
  {
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    category: "Production",
    title: "Corporate Video",
    metric: "23.1K Total Views",
    metricColor: "text-success",
  },
  {
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    category: "Strategy",
    title: "Marketing Campaign",
    metric: "+340% Reach",
    metricColor: "text-success",
  },
  {
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&h=400&fit=crop",
    category: "Content Creation",
    title: "Social Media Content",
    metric: "15K Engagements",
    metricColor: "text-success",
  },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Work</h2>
          <p className="text-muted-foreground text-lg">
            Explore our portfolio of successful campaigns and productions that have driven real results for our clients.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {portfolioItems.map((item, index) => (
            <Card key={index} className="group overflow-hidden border-0 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className={`text-sm font-medium ${item.metricColor}`}>{item.metric}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
