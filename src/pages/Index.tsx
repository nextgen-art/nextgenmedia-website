import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Performance from "@/components/Performance";
import About from "@/components/About";
import Contact from "@/components/Contact";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, profile, isAdmin, isClient, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is signed in, redirect to their dashboard
    if (!loading && user && profile) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (isClient) {
        navigate("/client-dashboard", { replace: true });
      } else {
        // Default to client dashboard if role not set
        navigate("/client-dashboard", { replace: true });
      }
    }
  }, [user, profile, isAdmin, isClient, loading, navigate]);

  return (
    <div className="landing-theme min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Performance />
        <About />
        <Contact />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
