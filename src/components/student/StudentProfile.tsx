import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Plus, 
  Edit, 
  Award, 
  Code, 
  ExternalLink, 
  Calendar,
  Upload,
  Brain,
  TrendingUp,
  Github,
  Linkedin,
  Mail,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface Project {
  id: string;
  title: string;
  description?: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
  start_date?: string;
  end_date?: string;
  status: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level: string;
  verified: boolean;
}

interface Certification {
  id: string;
  title: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  verified: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  badge_type: string;
  points: number;
  issued_date: string;
}

interface StudentProfileProps {
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export const StudentProfile = ({ profile, onProfileUpdate }: StudentProfileProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [completionScore, setCompletionScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
    fetchAvailableSkills();
  }, [profile.user_id]);

  useEffect(() => {
    calculateCompletionScore();
  }, [profile, projects, skills, certifications]);

  const fetchStudentData = async () => {
    try {
      const [projectsRes, skillsRes, certificationsRes, achievementsRes] = await Promise.all([
        supabase.from("projects").select("*").eq("student_id", profile.user_id),
        supabase.from("student_skills").select(`
          id,
          proficiency_level,
          verified,
          skills!inner(id, name, category)
        `).eq("student_id", profile.user_id),
        supabase.from("certifications").select("*").eq("student_id", profile.user_id),
        supabase.from("achievements").select("*").eq("student_id", profile.user_id)
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (skillsRes.data) {
        const formattedSkills = skillsRes.data.map((item: any) => ({
          id: item.id,
          name: item.skills.name,
          category: item.skills.category,
          proficiency_level: item.proficiency_level,
          verified: item.verified
        }));
        setSkills(formattedSkills);
      }
      if (certificationsRes.data) setCertifications(certificationsRes.data);
      if (achievementsRes.data) setAchievements(achievementsRes.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    const { data } = await supabase.from("skills").select("*").order("name");
    if (data) setAvailableSkills(data);
  };

  const calculateCompletionScore = () => {
    let score = 0;
    const weights = {
      basicInfo: 20,
      bio: 10,
      gpa: 10,
      contact: 10,
      projects: 20,
      skills: 15,
      certifications: 15
    };

    // Basic info completion
    if (profile.full_name && profile.email && profile.department) score += weights.basicInfo;
    if (profile.bio && profile.bio.length > 20) score += weights.bio;
    if (profile.gpa && profile.gpa > 0) score += weights.gpa;
    if (profile.phone || profile.linkedin_url || profile.github_url) score += weights.contact;
    if (projects.length > 0) score += weights.projects;
    if (skills.length > 0) score += weights.skills;
    if (certifications.length > 0) score += weights.certifications;

    setCompletionScore(Math.min(100, score));
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profileForm)
        .eq("user_id", profile.user_id);

      if (error) throw error;

      onProfileUpdate(profileForm);
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'student_id'>) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ 
          ...projectData, 
          student_id: profile.user_id,
          title: projectData.title || 'Untitled Project'
        }])
        .select()
        .single();

      if (error) throw error;

      setProjects([...projects, data]);
      toast({
        title: "Success",
        description: "Project added successfully",
      });
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive",
      });
    }
  };

  const addSkill = async (skillId: string, proficiencyLevel: string) => {
    try {
      const { error } = await supabase
        .from("student_skills")
        .insert([{ 
          student_id: profile.user_id, 
          skill_id: skillId, 
          proficiency_level: proficiencyLevel 
        }]);

      if (error) throw error;

      await fetchStudentData();
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const addCertification = async (certData: Omit<Certification, 'id' | 'student_id' | 'verified'>) => {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .insert([{ 
          ...certData, 
          student_id: profile.user_id,
          title: certData.title || 'Untitled Certification',
          issuing_organization: certData.issuing_organization || 'Unknown Organization'
        }])
        .select()
        .single();

      if (error) throw error;

      setCertifications([...certifications, data]);
      toast({
        title: "Success",
        description: "Certification added successfully",
      });
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Error",
        description: "Failed to add certification",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profile Completion Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Strength</span>
              <span>{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete your profile to improve visibility to recruiters
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">{profile.department || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Year of Study</Label>
                  <p className="text-sm text-muted-foreground">{profile.year_of_study || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">GPA</Label>
                  <p className="text-sm text-muted-foreground">{profile.gpa || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{profile.phone || "Not set"}</p>
                </div>
              </div>
              
              {profile.bio && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Bio</Label>
                  <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                </div>
              )}

              {(profile.linkedin_url || profile.github_url) && (
                <div className="mt-4 flex gap-2">
                  {profile.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {profile.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Projects</h3>
              <ProjectDialog onAdd={addProject} />
            </div>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No projects added yet</p>
                  <p className="text-sm text-muted-foreground">Add your first project to showcase your skills</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{project.title}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          )}
                          <div className="flex gap-1 mt-2">
                            {project.tech_stack?.map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {project.github_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-3 w-3 mr-1" />
                                  Code
                                </a>
                              </Button>
                            )}
                            {project.live_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Live Demo
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 'secondary'}
                          className="ml-4"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Skills</h3>
              <SkillDialog availableSkills={availableSkills} onAdd={addSkill} />
            </div>
            {skills.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No skills added yet</p>
                  <p className="text-sm text-muted-foreground">Add your skills to match with opportunities</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {['technical', 'soft'].map((category) => {
                  const categorySkills = skills.filter(skill => skill.category === category);
                  if (categorySkills.length === 0) return null;
                  
                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize">{category} Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map((skill) => (
                            <Badge
                              key={skill.id}
                              variant={skill.verified ? "default" : "secondary"}
                              className="flex items-center gap-1"
                            >
                              {skill.name}
                              <span className="text-xs">({skill.proficiency_level})</span>
                              {skill.verified && <Award className="h-3 w-3" />}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <CertificationDialog onAdd={addCertification} />
            </div>
            {certifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No certifications added yet</p>
                  <p className="text-sm text-muted-foreground">Add certifications to showcase your expertise</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {certifications.map((cert) => (
                  <Card key={cert.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{cert.title}</h4>
                          <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                          {cert.issue_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Issued: {new Date(cert.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          {cert.credential_url && (
                            <Button variant="outline" size="sm" className="mt-2" asChild>
                              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Certificate
                              </a>
                            </Button>
                          )}
                        </div>
                        {cert.verified && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Achievements & Badges</h3>
            {achievements.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground">Complete activities to earn badges and points</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          {achievement.description && (
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {achievement.badge_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {achievement.points} points
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(achievement.issued_date).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileForm.department || ''}
                  onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="year_of_study">Year of Study</Label>
                <Input
                  id="year_of_study"
                  type="number"
                  min="1"
                  max="4"
                  value={profileForm.year_of_study || ''}
                  onChange={(e) => setProfileForm({...profileForm, year_of_study: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={profileForm.gpa || ''}
                  onChange={(e) => setProfileForm({...profileForm, gpa: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileForm.bio || ''}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={profileForm.linkedin_url || ''}
                onChange={(e) => setProfileForm({...profileForm, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={profileForm.github_url || ''}
                onChange={(e) => setProfileForm({...profileForm, github_url: e.target.value})}
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={updateProfile} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Additional dialog components for adding projects, skills, and certifications
const ProjectDialog = ({ onAdd }: { onAdd: (project: Omit<Project, 'id' | 'student_id'>) => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    github_url: '',
    live_url: '',
    start_date: '',
    end_date: '',
    status: 'ongoing'
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    
    onAdd({
      title: form.title,
      description: form.description,
      tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
      github_url: form.github_url,
      live_url: form.live_url,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status as 'ongoing' | 'completed' | 'paused'
    });
    setForm({
      title: '',
      description: '',
      tech_stack: '',
      github_url: '',
      live_url: '',
      start_date: '',
      end_date: '',
      status: 'ongoing'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="My Awesome Project"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Brief description of your project..."
            />
          </div>
          <div>
            <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
            <Input
              id="tech_stack"
              value={form.tech_stack}
              onChange={(e) => setForm({...form, tech_stack: e.target.value})}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={form.github_url}
                onChange={(e) => setForm({...form, github_url: e.target.value})}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <Label htmlFor="live_url">Live URL</Label>
              <Input
                id="live_url"
                value={form.live_url}
                onChange={(e) => setForm({...form, live_url: e.target.value})}
                placeholder="https://myproject.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({...form, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={!form.title}>
            Add Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SkillDialog = ({ availableSkills, onAdd }: { 
  availableSkills: any[], 
  onAdd: (skillId: string, proficiency: string) => void 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState('beginner');

  const handleSubmit = () => {
    if (selectedSkill) {
      onAdd(selectedSkill, proficiency);
      setSelectedSkill('');
      setProficiency('beginner');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="skill">Skill</Label>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name} ({skill.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="proficiency">Proficiency Level</Label>
            <Select value={proficiency} onValueChange={setProficiency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={!selectedSkill}>
            Add Skill
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CertificationDialog = ({ onAdd }: { onAdd: (cert: Omit<Certification, 'id' | 'student_id' | 'verified'>) => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: ''
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.issuing_organization.trim()) return;
    
    onAdd({
      title: form.title,
      issuing_organization: form.issuing_organization,
      issue_date: form.issue_date,
      expiry_date: form.expiry_date,
      credential_id: form.credential_id,
      credential_url: form.credential_url
    });
    setForm({
      title: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: ''
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Certification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cert_title">Certification Title</Label>
            <Input
              id="cert_title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="AWS Certified Developer"
            />
          </div>
          <div>
            <Label htmlFor="issuing_org">Issuing Organization</Label>
            <Input
              id="issuing_org"
              value={form.issuing_organization}
              onChange={(e) => setForm({...form, issuing_organization: e.target.value})}
              placeholder="Amazon Web Services"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm({...form, issue_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({...form, expiry_date: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="credential_url">Credential URL</Label>
            <Input
              id="credential_url"
              value={form.credential_url}
              onChange={(e) => setForm({...form, credential_url: e.target.value})}
              placeholder="https://verify.certificate.com/..."
            />
          </div>
          <Button onClick={handleSubmit} disabled={!form.title || !form.issuing_organization}>
            Add Certification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};