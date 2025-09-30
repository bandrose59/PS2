import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "AI Tools", href: "/features/ai-tools" },
    { name: "Courses", href: "/courses" },
    { name: "About", href: "/about" },
    { name: "Demo", href: "/features/demo" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto rounded-xl bg-blue-400 border border-blue-500 shadow-lg">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">CampusConnect</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-white hover:text-blue-100 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="hidden md:inline-flex text-white hover:text-blue-100"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              variant="campus"
              className="hidden md:inline-flex"
              onClick={() => navigate("/auth")}
            >
              Join Campus
            </Button>

            {/* Mobile Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden text-white border-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-blue-400 border-t border-blue-500 rounded-b-xl">
            <div className="flex flex-col space-y-2 p-4">
              {navLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="text-white hover:text-blue-100 transition-colors py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button
                variant="ghost"
                className="text-white hover:text-blue-100"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button variant="campus" onClick={() => navigate("/auth")}>
                Join Campus
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
