import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">NEXTGEN MEDIA</h3>
            <p className="text-sm text-muted-foreground">
              Elevating brands through strategic media and creative excellence.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#services" className="hover:text-foreground transition-colors">Content Creation</Link></li>
              <li><Link to="#services" className="hover:text-foreground transition-colors">Social Media</Link></li>
              <li><Link to="#services" className="hover:text-foreground transition-colors">Lead Generation</Link></li>
              <li><Link to="#services" className="hover:text-foreground transition-colors">Ad Campaigns</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="#portfolio" className="hover:text-foreground transition-colors">Portfolio</Link></li>
              <li><Link to="#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
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
