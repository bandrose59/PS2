import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageCircle, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
  const stats = [
    { icon: Users, value: "50+", label: "Active Students", growth: "+23%" },
    { icon: MessageCircle, value: "100", label: "Messages Sent", growth: "+45%" },
    { icon: Star, value: "4.9/5", label: "User Rating", growth: "↗" },
    { icon: TrendingUp, value: "95%", label: "Satisfaction Rate", growth: "+12%" }
  ];

  return (
    <section id="community" className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
          Join Our
          <span className="block text-primary">Student Community</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          Connect with students across your campus. Share experiences, collaborate, and grow together.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-campus transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                <div className="text-xs text-primary font-medium">{stat.growth}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Button
            variant="campus"
            size="lg"
            className="min-w-[200px]"
          >
            Join Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Community;
