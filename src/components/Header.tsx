import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          NEXTGEN MEDIA
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="#services" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Services
          </Link>
          <Link to="#portfolio" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Portfolio
          </Link>
          <Link to="#about" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            About
          </Link>
          <Link to="#contact" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Contact
          </Link>
          <Button className="rounded-full">Get Started</Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
