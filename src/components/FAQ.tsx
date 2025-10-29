import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const faqs = [
  {
    question: "How do we know this will work?",
    answer: "Great question, we'll let our clients answer for us. Check out our Performance section above to see real results from one of our client's first month working with us. Our track record speaks for itself through measurable growth in engagement, reach, and conversions across various industries.",
  },
  {
    question: "How long have you guys been doing this?",
    answer: "NextGen Media has only existed since Summer 2025 but our team has done marketing separately in the past for about 7 years. We bring years of combined experience in digital marketing, content creation, and brand strategy to every project.",
  },
  {
    question: "Why should we go with you?",
    answer: "You shouldn't if you need to be convinced. We have a list of client testimonials, written, and recorded about their experiences with us & we want every client to genuinely want to partner with us because they feel like we'd be the best fit for them, not because they were convinced.",
  },
  {
    question: "How do I get a quote?",
    answer: "Complete our contact form below and we'll get back to you to discuss your needs and goals. We believe in personalized solutions, so we need to understand your unique challenges and objectives before providing an accurate quote. This ensures we deliver exactly what your business needs.",
  },
];

const FAQ = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={`bg-background border border-border rounded-xl px-6 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
