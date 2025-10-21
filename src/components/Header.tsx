import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl" style={{ fontFamily: "'Pacifico', cursive" }}>
          NextGen Media
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Services
          </a>
          <a href="#portfolio" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Portfolio
          </a>
          <a href="#about" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            About
          </a>
          <a href="#contact" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Contact
          </a>
          <a
            href="https://www.instagram.com/ngmedia.company/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 transition-colors"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <Button asChild className="rounded-full">
            <a href="#contact">Get Started</a>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
