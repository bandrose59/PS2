import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { aiToolsData } from "./aiToolsData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  LogOut, 
  Settings,
  TrendingUp,
  Calendar,
  FileText,
  Award,
  BookOpen,
  MessageSquare,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StudentProfile } from "@/components/student/StudentProfile";
import { OpportunityBrowser } from "@/components/student/OpportunityBrowser";
import Chatbot from "@/components/Chatbot";
import { useState, useEffect } from "react";

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

const ToolPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
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
  

  const tool = toolId ? aiToolsData[toolId as keyof typeof aiToolsData] : undefined;

  if (!tool) return <p className="text-center mt-20 text-red-500">Tool not found</p>;

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
      </nav>
      <div className="container mx-auto px-4 py-12">

              <Button variant="ghost" onClick={() => navigate("/ai-tools")} className="mb-6">
                  ← Back to Tools
              </Button>

              <Card className="p-6">
                  <CardHeader>
                      <CardTitle className="text-2xl">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground mb-4">{tool.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                          {tool.benefits.map((b, i) => (
                              <Badge key={i} variant="secondary">{b}</Badge>
                          ))}
                      </div>
                      <Button variant="campus">Start Using {tool.title}</Button>
                  </CardContent>
              </Card>
          </div></>
  );
};

export default ToolPage;
