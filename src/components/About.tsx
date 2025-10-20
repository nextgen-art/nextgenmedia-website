const About = () => {
  return (
    <section id="about" className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-muted order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"
              alt="Modern office space"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold">About NextGen Media</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                We're Angel Garcia and Giovanni Cruz, two 21-year-old entrepreneurs from New Jersey who started NextGen Media with one simple mission: to help businesses generate leads, grow their online presence, and thrive using modern marketing strategies.
              </p>
              
              <p>
                We don't come from wealth. Everything we've built has come from hard work, persistence, and a passion for creating results. From a young age, we've both understood that the business world is shifting fast — traditional marketing is losing its grip, and social media has become the new storefront. But we also realized that many businesses, especially small and local ones, struggle to keep up with this change.
              </p>
              
              <p>
                That's why we created NextGen Media — a social media marketing agency built by the new generation, for all generations of business owners to reap the benefits of modern methods.
              </p>
              
              <p>
                We know what it's like to start from nothing, and the process of growing on social media, which is why we're dedicated to helping businesses turn attention into customers using modern, data-driven methods. Whether it's content creation, paid ads, or lead-generation strategies, we specialize in helping brands stand out, connect with their audience, and scale faster than ever before through professional — eye catching content.
              </p>
              
              <p>
                For us, this isn't just a business — it's a movement. We believe that businesses deserve the same tools and strategies that big brands use to dominate online. Our goal is to level the playing field and give every business we work with the chance to win in today's market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
