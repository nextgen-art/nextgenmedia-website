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
          <a
            href="https://www.tiktok.com/@ngmedia.company"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 transition-colors"
            aria-label="Follow us on TikTok"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
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
