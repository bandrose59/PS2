import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Trophy,
  GraduationCap,
  Brain,
  BarChart3,
  Calendar,
  Award,
  Target,
  Building,
  MessageSquare,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
   
    {
      icon: Briefcase,
      title: "Smart Opportunity Browser",
      description:
        "AI-powered job and internship matching with advanced filters for skills, location, stipend, and conversion chances.",
      color: "text-campus-cyan",
    },
    {
      icon: Brain,
      title: "AI Resume Enhancer",
      description:
        "Intelligent resume analysis and suggestions. Auto-format improvements and missing skills detection.",
      color: "text-campus-success",
    },
    {
      icon: Target,
      title: "AI Job Recommendations",
      description:
        "Personalized job matching based on skills, GPA, preferences, and performance predictions.",
      color: "text-campus-warning",
    },
    {
      icon: Calendar,
      title: "Interview Scheduling",
      description:
        "Clash-free scheduling with academic calendar sync, Google/Outlook integration, and automated notifications.",
      color: "text-campus-cyan",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description:
        "Placement probability tracking, department heatmaps, student performance forecasting, and trend analysis.",
      color: "text-campus-success",
    },
    {
      icon: Award,
      title: "Gamified Achievements",
      description:
        "Motivational badge system, leaderboards, and progress tracking to encourage skill development.",
      color: "text-campus-warning",
    },
    {
      icon: MessageSquare,
      title: "Peer Collaboration",
      description:
        "Student project groups, skill-building communities, and collaborative learning visible to recruiters.",
      color: "text-campus-purple",
    },
    {
      icon: FileText,
      title: "Application Workflow",
      description:
        "One-click applications, automated mentor notifications, streamlined approval/rejection processes.",
      color: "text-campus-cyan",
    },
    {
      icon: Trophy,
      title: "Certificate Automation",
      description:
        "Automated certificate generation from supervisor feedback, skill verification, and achievement tracking.",
      color: "text-campus-warning",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Complete Student Placement
            <span className="block text-primary">Platform Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            From AI-powered job matching to automated interview scheduling, our
            comprehensive platform handles every aspect of student placement
            and career development.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 bg-white border rounded-2xl cursor-pointer"
              onClick={() => navigate("/auth")}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`p-3 rounded-full bg-white mr-4 ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <Button
                  variant="ghost"
                  className="group-hover:text-primary transition-colors"
                >
                  Explore Feature →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="campus" size="lg" onClick={() => navigate("/auth")}>
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;