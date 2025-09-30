import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  FileText, 
  Check, 
  Clock, 
  Download,
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  Briefcase,
  LogOut,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StudentProfile } from "@/components/student/StudentProfile";
import { OpportunityBrowser } from "@/components/student/OpportunityBrowser";
import Chatbot from "@/components/Chatbot";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "student" | "mentor" | "tnp" | "recruiter";
  department?: string;
  year_of_study?: number;
  gpa?: number;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  bio?: string;
  avatar_url?: string;
}

const CertificatesFeature = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="h-5 w-5" />;
      case "mentor":
        return <Users className="h-5 w-5" />;
      case "tnp":
        return <Briefcase className="h-5 w-5" />;
      case "recruiter":
        return <Briefcase className="h-5 w-5" />;
      default:
        return <GraduationCap className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-500";
      case "mentor":
        return "bg-green-500";
      case "tnp":
        return "bg-purple-500";
      case "recruiter":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">Profile not found</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const features = [
    {
      icon: FileText,
      title: "Automated Certificate Generation",
      description: "Generate professional certificates instantly from supervisor feedback and project completions.",
      benefits: ["Instant generation", "Professional templates", "Digital signatures", "Blockchain verification"]
    },
    {
      icon: Shield,
      title: "Skill Verification System",
      description: "Verify student skills through automated assessments and peer reviews.",
      benefits: ["Skill badges", "Peer verification", "Industry standards", "Progress tracking"]
    },
    {
      icon: Trophy,
      title: "Achievement Tracking",
      description: "Track and showcase all academic and project achievements in one place.",
      benefits: ["Achievement history", "Progress visualization", "Milestone tracking", "Performance analytics"]
    },
    {
      icon: Sparkles,
      title: "AI-Powered Recommendations",
      description: "Get personalized certificate recommendations based on career goals and skill gaps.",
      benefits: ["Career alignment", "Skill gap analysis", "Learning path suggestions", "Industry insights"]
    }
  ];

  const certificateTypes = [
    {
      title: "Project Completion",
      description: "Certificates for successfully completed projects",
      icon: FileText,
      color: "text-campus-cyan"
    },
    {
      title: "Skill Proficiency",
      description: "Verification of technical and soft skills",
      icon: Star,
      color: "text-campus-success"
    },
    {
      title: "Academic Achievement",
      description: "Recognition for academic excellence",
      icon: Trophy,
      color: "text-campus-warning"
    },
    {
      title: "Leadership",
      description: "Certificates for leadership activities",
      icon: Award,
      color: "text-campus-purple"
    }
  ];

  return (
        <>
        <nav className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">CampusConnect</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback className={getRoleColor(profile.role)}>
                {getRoleIcon(profile.role)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>

    <div className="min-h-screen bg-gradient-subtle">
       <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </Button>
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <Award className="h-16 w-16 text-primary mr-4" />
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground">
                  Certificate
                  <span className="block text-primary">Automation</span>
                </h1>
              </div>

              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Automated certificate generation from supervisor feedback.
                Instant skill verification and achievement tracking.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/auth")}
                >
                  Start Earning Certificates
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/features/demo")}
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Automated Certificate System
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform how certificates are generated, verified, and tracked in your institution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-campus transition-all duration-300 bg-gradient-card border-0">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10 mr-4">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-campus-success mr-2" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certificate Types */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Certificate Types
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive certification system covering all aspects of student development.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certificateTypes.map((type, index) => (
                <Card key={index} className="text-center hover:shadow-campus transition-all duration-300 bg-gradient-card border-0">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-4 rounded-full bg-gradient-card mb-4 ${type.color}`}>
                      <type.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{type.title}</h3>
                    <p className="text-muted-foreground text-sm">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Flow */}
        <section className="py-20 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Simple and automated certificate generation process.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Complete Activity</h3>
                  <p className="text-muted-foreground">Student completes project, skill assessment, or academic milestone.</p>
                </div>

                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Supervisor Review</h3>
                  <p className="text-muted-foreground">Supervisor provides feedback and approves the completion.</p>
                </div>

                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Auto Certificate</h3>
                  <p className="text-muted-foreground">Certificate is automatically generated and added to student profile.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Ready to Automate Your Certificates?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of institutions already using our automated certificate system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/auth")}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/contact")}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div></>
  );
};

export default CertificatesFeature;