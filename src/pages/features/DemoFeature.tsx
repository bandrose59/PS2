import { ArrowLeft, Play, Users, Briefcase, Brain, BarChart, GraduationCap, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const DemoFeature = () => {
  const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
;
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
  

  const demoSections = [
    {
      icon: Users,
      title: "Student Journey",
      description: "Watch how students create profiles, discover opportunities, and apply for jobs",
      duration: "3 min",
      highlights: ["Profile Creation", "Skill Assessment", "Job Discovery", "Application Process"]
    },
    {
      icon: Briefcase,
      title: "Recruiter Workflow",
      description: "See how recruiters post jobs, review applications, and schedule interviews",
      duration: "4 min", 
      highlights: ["Job Posting", "Candidate Review", "Interview Scheduling", "Feedback System"]
    },
    {
      icon: Brain,
      title: "AI Features",
      description: "Experience our AI-powered matching, resume enhancement, and career recommendations",
      duration: "5 min",
      highlights: ["Smart Matching", "Resume Analysis", "Career Roadmap", "Skill Gap Analysis"]
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Explore comprehensive analytics for placement tracking and performance insights",
      duration: "3 min",
      highlights: ["Placement Analytics", "Performance Metrics", "Department Insights", "Trend Analysis"]
    }
  ];

  return (
        <><nav className="border-b bg-background/95 backdrop-blur">
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
    </nav><div className="min-h-screen bg-gradient-subtle">
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
                <h1 className="text-3xl font-bold text-foreground">Platform Demo</h1>
                <p className="text-muted-foreground">Interactive demonstrations of key features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              See Our Platform
              <span className="block text-primary">In Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore interactive demos showcasing the complete student placement workflow,
              from profile creation to job placement and beyond.
            </p>
          </div>

          {/* Demo Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {demoSections.map((section, index) => (
              <Card key={index} className="border-0 bg-gradient-card hover:shadow-campus transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <section.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <p className="text-muted-foreground text-sm">{section.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{section.duration}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {section.highlights.map((highlight, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Demo */}
          <div className="bg-background rounded-lg p-8 mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
              Try It Yourself
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Student Portal</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Experience the student interface with sample data
                </p>
                <Button variant="outline" size="sm">Launch Demo</Button>
              </Card>
              <Card className="text-center p-6">
                <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Recruiter Dashboard</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Test the recruiter workflow and features
                </p>
                <Button variant="outline" size="sm">Launch Demo</Button>
              </Card>
              <Card className="text-center p-6">
                <BarChart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Admin Analytics</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore comprehensive placement analytics
                </p>
                <Button variant="outline" size="sm">Launch Demo</Button>
              </Card>
            </div>
          </div>

          {/* Full Demo Video */}
          <div className="text-center bg-background rounded-lg p-12">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Complete Platform Overview
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Watch our comprehensive 10-minute demo covering all major features,
              from student onboarding to successful job placement.
            </p>
            <div className="bg-gradient-subtle rounded-lg p-8 mb-6">
              <Play className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Full Platform Demo - 10 minutes</p>
            </div>
            <Button variant="campus" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Watch Full Demo
            </Button>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Ready to get started?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="campus"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/contact")}
              >
                Schedule Live Demo
              </Button>
            </div>
          </div>
        </div>
      </div></>
  );
};

export default DemoFeature;