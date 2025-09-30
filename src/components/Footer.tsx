import { GraduationCap, Github, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Community", href: "#community" },
      { name: "Events", href: "#events" },
      { name: "Pricing", href: "#pricing" }
    ],
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Contact Us", href: "#contact" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" }
    ],
    campus: [
      { name: "For Universities", href: "#universities" },
      { name: "Student Organizations", href: "#organizations" },
      { name: "Campus Partners", href: "#partners" },
      { name: "Resources", href: "#resources" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "#github", label: "GitHub" },
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Instagram, href: "#instagram", label: "Instagram" }
  ];

  return (
    <footer className="bg-white border-t border-border rounded-t-3xl">
      <div className="container mx-auto px-4 py-16 text-center">
        {/* Newsletter Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Stay Connected</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get the latest updates on campus events, new features, and community highlights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="flex-1"
            />
            <Button variant="campus">Subscribe</Button>
          </div>
        </div>

        <Separator className="border-border mb-12" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-foreground">
          {/* Brand */}
          <div className="lg:col-span-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">CampusConnect</span>
            </div>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Connecting students across campuses worldwide. Build your community, share knowledge, 
              and create lasting memories with CampusConnect.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              {socialLinks.map((social, index) => (
                <Button key={index} variant="ghost" size="icon" asChild>
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {["product", "support", "campus"].map((section, idx) => (
            <div key={idx} className="text-center lg:text-left">
              <h4 className="font-semibold mb-4">{section.charAt(0).toUpperCase() + section.slice(1)}</h4>
              <ul className="space-y-3">
                {footerLinks[section].map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="border-border mb-8" />

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-muted-foreground">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <Mail className="h-4 w-4 text-primary" />
            <span>hello@campusconnect.edu</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <Phone className="h-4 w-4 text-primary" />
            <span>+91 12345 67890</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span>SGGS, Nanded, Maharashtra, India</span>
          </div>
        </div>

        <Separator className="border-border mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center text-muted-foreground text-sm">
          <p>© 2024 CampusConnect. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ for students worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
