import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Briefcase, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-blue-200 to-white rounded-b-2xl"></div>
        {/* Subtle overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent rounded-b-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Your Complete
            <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Placement Platform
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto leading-relaxed">
            AI-powered job matching, smart application workflows, and
            comprehensive career development tools for students, mentors, and
            placement teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              variant="hero"
              size="lg"
              className="min-w-[200px]"
              onClick={() => navigate("/auth")}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] border-white/30 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20"
              onClick={() => navigate("/features/demo")}
            >
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <Users className="h-8 w-8 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-white/80">Students Placed</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <Briefcase className="h-8 w-8 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-white/80">Job Opportunities</div>
            </div>
            <div className="flex flex-col items-center p-4">
              <Trophy className="h-8 w-8 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">95%</div>
              <div className="text-white/80">Placement Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full animate-float"></div>
      <div
        className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200/20 backdrop-blur-sm rounded-full animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 right-20 w-12 h-12 bg-white/15 backdrop-blur-sm rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
    </section>
  );
};

export default Hero;
