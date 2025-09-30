import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  TrendingUp,
  Clock,
  Send,
  Heart,
  Star,
  Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobOpportunity {
  id: string;
  title: string;
  company_name: string;
  job_type: string;
  location: string;
  location_type: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  min_gpa?: number;
  min_experience_months: number;
  stipend_min?: number;
  stipend_max?: number;
  conversion_chance?: string;
  application_deadline?: string;
  start_date?: string;
  duration_months?: number;
  status: string;
  created_at: string;
}

interface Application {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
}

interface Profile {
  user_id: string;
  gpa?: number;
}

interface OpportunityBrowserProps {
  profile: Profile;
}

export const OpportunityBrowser = ({ profile }: OpportunityBrowserProps) => {
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<JobOpportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [recommendedJobs, setRecommendedJobs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOpportunities();
    fetchApplications();
    getAIRecommendations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [opportunities, searchTerm, filterType, filterLocation]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("job_opportunities")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, status, applied_at")
        .eq("student_id", profile.user_id);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const getAIRecommendations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-job-recommendations', {
        body: { student_id: profile.user_id }
      });

      if (error) throw error;
      if (data?.recommended_job_ids) {
        setRecommendedJobs(data.recommended_job_ids);
      }
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
    }
  };

  const applyFilters = () => {
    let filtered = opportunities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(job => job.job_type === filterType);
    }

    // Location filter
    if (filterLocation !== "all") {
      filtered = filtered.filter(job => job.location_type === filterLocation);
    }

    // Sort by AI recommendations first
    filtered.sort((a, b) => {
      const aRecommended = recommendedJobs.includes(a.id);
      const bRecommended = recommendedJobs.includes(b.id);
      
      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredOpportunities(filtered);
  };

  const applyForJob = async (jobId: string, coverLetter: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .insert([{
          student_id: profile.user_id,
          job_id: jobId,
          cover_letter: coverLetter,
          status: "applied"
        }]);

      if (error) throw error;

      await fetchApplications();
      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
    } catch (error: any) {
      console.error("Error applying for job:", error);
      if (error.code === '23505') {
        toast({
          title: "Already Applied",
          description: "You have already applied for this position",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit application",
          variant: "destructive",
        });
      }
    }
  };

  const getApplicationStatus = (jobId: string) => {
    return applications.find(app => app.job_id === jobId);
  };

  const calculateMatchScore = (job: JobOpportunity) => {
    let score = 0;
    const maxScore = 100;

    // GPA match (30 points)
    if (job.min_gpa && profile.gpa) {
      if (profile.gpa >= job.min_gpa) {
        score += 30;
      } else if (profile.gpa >= job.min_gpa - 0.5) {
        score += 15;
      }
    } else if (!job.min_gpa) {
      score += 30; // No GPA requirement
    }

    // AI recommendation boost (40 points)
    if (recommendedJobs.includes(job.id)) {
      score += 40;
    }

    // Job type preference (15 points)
    if (job.job_type === 'internship') {
      score += 15; // Assume students prefer internships
    }

    // Recent posting (15 points)
    const daysSincePosted = (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePosted <= 7) {
      score += 15;
    } else if (daysSincePosted <= 30) {
      score += 7;
    }

    return Math.min(score, maxScore);
  };

  const getConversionChanceColor = (chance?: string) => {
    switch (chance) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading opportunities...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Location Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="on-site">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations Section */}
      {recommendedJobs.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              AI Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Based on your skills, GPA, and preferences, we found {recommendedJobs.length} opportunities that match your profile.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const application = getApplicationStatus(opportunity.id);
          const matchScore = calculateMatchScore(opportunity);
          const isRecommended = recommendedJobs.includes(opportunity.id);
          
          return (
            <Card key={opportunity.id} className={`transition-all hover:shadow-md ${isRecommended ? 'border-primary/30 bg-primary/2' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                      {isRecommended && (
                        <Badge variant="default" className="bg-primary">
                          <Star className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${matchScore >= 70 ? 'border-green-500 text-green-700' : matchScore >= 50 ? 'border-yellow-500 text-yellow-700' : 'border-red-500 text-red-700'}`}
                      >
                        {matchScore}% Match
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {opportunity.company_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location} ({opportunity.location_type})
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {opportunity.job_type}
                      </div>
                      {opportunity.stipend_min && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ₹{opportunity.stipend_min.toLocaleString()}
                          {opportunity.stipend_max && ` - ₹${opportunity.stipend_max.toLocaleString()}`}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {opportunity.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {opportunity.required_skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {opportunity.required_skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{opportunity.required_skills.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {opportunity.application_deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Apply by {new Date(opportunity.application_deadline).toLocaleDateString()}
                        </div>
                      )}
                      {opportunity.duration_months && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {opportunity.duration_months} months
                        </div>
                      )}
                      {opportunity.conversion_chance && (
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${getConversionChanceColor(opportunity.conversion_chance)}`} />
                          {opportunity.conversion_chance} conversion chance
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    {application ? (
                      <Badge 
                        variant={application.status === 'selected' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {application.status.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <ApplicationDialog 
                        opportunity={opportunity} 
                        onApply={applyForJob}
                        disabled={!!application}
                      />
                    )}
                    
                    {opportunity.min_gpa && (
                      <div className="text-xs text-muted-foreground">
                        Min GPA: {opportunity.min_gpa}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOpportunities.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new postings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const ApplicationDialog = ({ 
  opportunity, 
  onApply, 
  disabled 
}: { 
  opportunity: JobOpportunity, 
  onApply: (jobId: string, coverLetter: string) => void,
  disabled: boolean
}) => {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await onApply(opportunity.id, coverLetter);
      setOpen(false);
      setCoverLetter("");
    } catch (error) {
      console.error("Application error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-24">
          <Send className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {opportunity.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{opportunity.company_name}</h4>
            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
          </div>
          
          <div>
            <Label htmlFor="cover_letter" className="text-sm font-medium">
              Cover Letter
            </Label>
            <Textarea
              id="cover_letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a brief cover letter explaining why you're interested in this position and what makes you a good fit..."
              className="mt-1 h-32"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Mention specific skills from the job requirements that you possess, 
              and highlight relevant projects or experiences.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleApply} 
              disabled={loading || !coverLetter.trim()}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};