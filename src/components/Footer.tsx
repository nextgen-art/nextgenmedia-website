import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">NEXTGEN MEDIA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Elevating brands through strategic media and creative excellence.
            </p>
            <a
              href="https://www.instagram.com/ngmedia.company/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-foreground/80 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow us on Instagram</span>
            </a>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground transition-colors">Content Creation</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">Social Media</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">Lead Generation</a></li>
              <li><a href="#services" className="hover:text-foreground transition-colors">Ad Campaigns</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#portfolio" className="hover:text-foreground transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@nextgenmedia.com</li>
              <li>(555) 123-4567</li>
              <li>123 Business Street</li>
              <li>City, State 12345</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NextGen Media. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
