import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="w-full py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Elevate Your Brand
              <br />
              With Strategic Media
            </h1>
            
            <p className="text-muted-foreground text-lg max-w-md">
              We deliver exceptional media services, creative consultation, and production excellence. Transform your vision into compelling content that resonates with your audience.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full">
                Start Your Project
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                View Our Work
              </Button>
            </div>
          </div>
          
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-muted">
            <img 
              src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop"
              alt="Professional video camera equipment"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
