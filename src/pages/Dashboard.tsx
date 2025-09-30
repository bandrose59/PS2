import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const Dashboard = () => {
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

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Complete your profile to improve</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 pending reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next: Tomorrow 2PM</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex gap-3">
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <BookOpen className="h-4 w-4 mr-2" />
          My Courses
        </Button>
        <Button variant="outline" onClick={() => navigate('/features/ai-tools')}>
          <Brain className="h-4 w-4 mr-2" />
          AI Career Tools
        </Button>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">AI Job Matching</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card className="mb-4 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">AI Recommendation Engine</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your skills, GPA, projects, and preferences to match you with the best internship opportunities.
              </p>
            </CardContent>
          </Card>
          <OpportunityBrowser profile={profile} />
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { company: "Google", position: "Software Engineer Intern", status: "Under Review", date: "Applied 2 days ago", color: "bg-yellow-500" },
                  { company: "Microsoft", position: "Product Manager Intern", status: "Interview Scheduled", date: "Applied 1 week ago", color: "bg-blue-500" },
                  { company: "Amazon", position: "Data Analyst Intern", status: "Pending", date: "Applied 3 days ago", color: "bg-gray-500" },
                  { company: "Meta", position: "UX Designer Intern", status: "Shortlisted", date: "Applied 5 days ago", color: "bg-green-500" },
                  { company: "Apple", position: "iOS Developer Intern", status: "Rejected", date: "Applied 2 weeks ago", color: "bg-red-500" }
                ].map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{app.company}</h4>
                      <p className="text-sm text-muted-foreground">{app.position}</p>
                      <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                    </div>
                    <Badge className={`${app.color} text-white`}>{app.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <StudentProfile profile={profile} onProfileUpdate={setProfile} />
        </TabsContent>
<TabsContent value="settings">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Profile Visibility Card */}
    <Card className="bg-background/50 border border-gray-200 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="flex items-center justify-between border-b border-gray-200 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Profile Visibility</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Control who can view your profile
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              defaultChecked
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-sm font-medium">Public (Visible to recruiters and mentors)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="visibility" className="w-5 h-5 accent-blue-500" />
            <span className="text-sm font-medium">Private (Only visible to you)</span>
          </label>
        </div>
      </CardContent>
    </Card>

    {/* Email Notifications Card */}
    <Card className="bg-background/50 border border-gray-200 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="flex items-center justify-between border-b border-gray-200 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-500" />
          <span className="text-sm font-medium">New job opportunities matching your profile</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-500" />
          <span className="text-sm font-medium">Application status updates</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-green-500" />
          <span className="text-sm font-medium">Weekly career insights</span>
        </label>
      </CardContent>
    </Card>

    {/* Danger Zone Card */}
    <Card className="bg-background/50 border border-gray-200 shadow-md hover:shadow-lg transition-all md:col-span-2">
      <CardHeader className="flex items-center justify-between border-b border-gray-200 pb-2">
        <CardTitle className="text-lg font-semibold text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          This action will sign you out of your account immediately.
        </p>
        <Button
          variant="destructive"
          className="flex items-center gap-2 w-full justify-center hover:bg-red-700 transition-all"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  </div>
</TabsContent>

      </Tabs>
    </div>
  );

  const renderMentorDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Mentored</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">5 new this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Applications to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Student placement rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Student applications requiring review will appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTnPDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Hiring this semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">12 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Recent placement activities will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Partner Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Company management interface will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderRecruiterDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">Ready for placement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">For open positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">For interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Student Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Student profiles matching your requirements will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Applications for your job postings will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground">
            {profile.role === "student" && "Track your placement journey and discover new opportunities"}
            {profile.role === "mentor" && "Guide students and review their progress"}
            {profile.role === "tnp" && "Manage placements and coordinate with companies"}
            {profile.role === "recruiter" && "Find and recruit talented students for your company"}
          </p>
        </div>

        {profile.role === "student" && renderStudentDashboard()}
        {profile.role === "mentor" && renderMentorDashboard()}
        {profile.role === "tnp" && renderTnPDashboard()}
        {profile.role === "recruiter" && renderRecruiterDashboard()}
      </main>
      
      <Chatbot />
    </div>
  );
};

export default Dashboard;
