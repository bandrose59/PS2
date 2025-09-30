import { BookOpen, Clock, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Briefcase, 
  LogOut, 
  Settings,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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


const courses = [
  { id: 1, title: "Full Stack Web Development", instructor: "Dr. Sarah Johnson", duration: "12 weeks", level: "Intermediate", enrolled: 234, progress: 65, category: "Development", description: "Master React, Node.js, and modern web technologies" },
  { id: 2, title: "Data Science & Machine Learning", instructor: "Prof. Michael Chen", duration: "16 weeks", level: "Advanced", enrolled: 189, progress: 40, category: "AI/ML", description: "Learn Python, TensorFlow, and statistical analysis" },
  { id: 3, title: "Mobile App Development", instructor: "Emily Rodriguez", duration: "10 weeks", level: "Beginner", enrolled: 312, progress: 85, category: "Mobile", description: "Build iOS and Android apps with React Native" },
  { id: 4, title: "Cloud Computing & DevOps", instructor: "James Wilson", duration: "8 weeks", level: "Intermediate", enrolled: 167, progress: 30, category: "Cloud", description: "AWS, Docker, Kubernetes, and CI/CD pipelines" },
  { id: 5, title: "UI/UX Design Fundamentals", instructor: "Lisa Anderson", duration: "6 weeks", level: "Beginner", enrolled: 421, progress: 100, category: "Design", description: "Design thinking, prototyping, and user research" },
  { id: 6, title: "Cybersecurity Essentials", instructor: "Dr. Robert Kumar", duration: "14 weeks", level: "Advanced", enrolled: 145, progress: 20, category: "Security", description: "Network security, ethical hacking, and compliance" },
  // Add 4 more courses to make 10+
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner": return "bg-green-500/10 text-green-500";
    case "Intermediate": return "bg-yellow-500/10 text-yellow-500";
    case "Advanced": return "bg-red-500/10 text-red-500";
    default: return "bg-gray-500/10 text-gray-500";
  }
};

const Courses = () => {
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
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </Button>

        <h1 className="text-4xl font-bold mb-6 text-foreground">My Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between mb-2">
                  <Badge variant="secondary" className={getLevelColor(course.level)}>{course.level}</Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</div>
                  <div className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrolled} enrolled</div>
                </div>
                <Progress value={course.progress} className="h-2 mb-4" />
                <Button
                  className="w-full"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {course.progress === 100 ? "Review Course" : "Continue Learning"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div></>
  );
};

export default Courses;
