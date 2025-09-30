import { ArrowLeft, Users, Target, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Connecting students with their dream careers through intelligent technology and personalized guidance."
    },
    {
      icon: Users,
      title: "Student-First",
      description: "Every feature is designed with student success in mind, prioritizing their career growth and development."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality platform that sets new standards in placement technology."
    },
    {
      icon: Globe,
      title: "Inclusive",
      description: "Building opportunities for all students regardless of background, creating equal access to career success."
    }
  ];

  const team = [
    { name: "Sarah Chen", role: "CEO & Co-founder", background: "Former Google PM, Stanford MBA" },
    { name: "Raj Patel", role: "CTO & Co-founder", background: "Ex-Microsoft Engineer, IIT Delhi" },
    { name: "Emily Rodriguez", role: "Head of AI", background: "PhD ML, Carnegie Mellon" },
    { name: "David Kim", role: "Head of Product", background: "Former Meta Product Lead" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">About CampusConnect</h1>
              <p className="text-muted-foreground">Revolutionizing student placement through technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Empowering Students to
            <span className="block text-primary">Achieve Career Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Founded in 2023, CampusConnect emerged from a simple belief: every student deserves 
            access to meaningful career opportunities. We're transforming how students discover, 
            apply for, and secure their dream jobs through innovative AI technology.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-foreground">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The idea for CampusConnect was born in a university placement cell, where we witnessed 
                talented students struggling to find opportunities that matched their skills and aspirations. 
                Traditional placement processes were inefficient, time-consuming, and often overlooked 
                deserving candidates.
              </p>
              <p>
                We envisioned a platform that could intelligently match students with opportunities, 
                streamline application processes, and provide personalized career guidance. Today, 
                CampusConnect serves over 10,000 students across 50+ universities, with a 95% 
                placement success rate.
              </p>
              <p>
                Our platform has evolved from a simple job board to a comprehensive career development 
                ecosystem, powered by cutting-edge AI and built with deep understanding of student needs.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6 text-foreground">Impact by Numbers</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Students Placed</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Partner Companies</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Universities</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-foreground">
            Our Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 bg-gradient-card text-center p-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-foreground">
            Meet Our Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-card rounded-full mx-auto mb-4"></div>
                <h4 className="font-semibold mb-1">{member.name}</h4>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.background}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Future Vision */}
        <div className="bg-background rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold mb-4 text-center text-foreground">
            Our Vision for the Future
          </h3>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto">
            We're building the world's most intelligent career development platform, where every student 
            receives personalized guidance, every company finds the perfect talent, and every career 
            journey is optimized for success. The future of student placement is here, and it's powered 
            by AI, driven by data, and focused on human potential.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Join Our Mission
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="campus" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Get Started Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/contact")}
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;