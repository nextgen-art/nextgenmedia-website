import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do we know this will work?",
    answer: "Great question, we'll let our clients answer for us. Our track record speaks for itself through the testimonials and measurable results our clients have achieved. We've consistently delivered significant growth in engagement, reach, and conversions across various industries.",
  },
  {
    question: "How long have you guys been doing this?",
    answer: "NextGen Media has only existed since Summer 2025 but our team has done marketing separately in the past for about 7 years. We bring years of combined experience in digital marketing, content creation, and brand strategy to every project.",
  },
  {
    question: "Why should we go with you?",
    answer: "You shouldn't if you need to be convinced. We have a list of client testimonials, written, and recorded about their experiences with us & we want every client to genuine want to partner with us because they feel like we'd be the best fit for them, not because they were convinced.",
  },
  {
    question: "How do I get a quote?",
    answer: "Book a call so we can discuss needs and goals. We believe in personalized solutions, so we need to understand your unique challenges and objectives before providing an accurate quote. This ensures we deliver exactly what your business needs.",
  },
];

const FAQ = () => {
  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background border border-border rounded-xl px-6"
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
