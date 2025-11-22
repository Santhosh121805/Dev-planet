import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Github, Linkedin, User, Plus, X } from "lucide-react";

interface CreateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreated: (profile: DeveloperProfile) => void;
}

export interface DeveloperProfile {
  id: number;
  name: string;
  primaryLanguage: string;
  framework: string;
  expertise: string;
  github: string;
  linkedin: string;
  bio: string;
  currentProject: string;
  skills: string[];
  activityLevel: number;
  projects: number;
  contributions: number;
  isUserCreated?: boolean;
}

const languages = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C#", "C++", 
  "PHP", "Ruby", "Swift", "Kotlin", "Solidity", "Dart", "Scala", "R"
];

const frameworks = [
  "React", "Vue.js", "Angular", "Next.js", "Svelte", "Django", "FastAPI", 
  "Flask", "Spring Boot", "Express.js", "Node.js", "Laravel", "Rails", 
  "ASP.NET", "Flutter", "React Native", "TensorFlow", "PyTorch", "Web3", 
  "Hardhat", "Truffle", "Unity", "Unreal Engine"
];

const expertiseLevels = ["Beginner", "Mid-level", "Senior", "Expert"];

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  open,
  onOpenChange,
  onProfileCreated
}) => {
  const [formData, setFormData] = useState({
    name: "",
    primaryLanguage: "",
    framework: "",
    expertise: "",
    github: "",
    linkedin: "",
    bio: "",
    currentProject: "",
    skills: [] as string[]
  });

  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the developer profile
      const profile: DeveloperProfile = {
        id: Date.now(), // Simple ID generation for demo
        name: formData.name,
        primaryLanguage: formData.primaryLanguage,
        framework: formData.framework,
        expertise: formData.expertise,
        github: formData.github.startsWith('http') ? formData.github : `https://github.com/${formData.github}`,
        linkedin: formData.linkedin.startsWith('http') ? formData.linkedin : `https://linkedin.com/in/${formData.linkedin}`,
        bio: formData.bio,
        currentProject: formData.currentProject,
        skills: formData.skills,
        activityLevel: Math.floor(Math.random() * 30) + 70, // Random activity level between 70-100
        projects: Math.floor(Math.random() * 20) + 5, // Random projects between 5-25
        contributions: Math.floor(Math.random() * 500) + 100, // Random contributions between 100-600
        isUserCreated: true
      };

      // Call the callback to add the profile
      onProfileCreated(profile);

      // Reset form
      setFormData({
        name: "",
        primaryLanguage: "",
        framework: "",
        expertise: "",
        github: "",
        linkedin: "",
        bio: "",
        currentProject: "",
        skills: []
      });

      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const isFormValid = formData.name && formData.primaryLanguage && formData.framework && formData.expertise;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Code className="w-6 h-6 text-purple-500" />
            Create Your Developer Profile
          </DialogTitle>
          <DialogDescription>
            Join the MilkyWay galaxy and showcase your skills to the developer community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryLanguage">Primary Language *</Label>
                <Select
                  value={formData.primaryLanguage}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, primaryLanguage: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="framework">Main Framework *</Label>
                <Select
                  value={formData.framework}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, framework: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select main framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map(fw => (
                      <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise Level *</Label>
              <Select
                value={formData.expertise}
                onValueChange={(value) => setFormData(prev => ({ ...prev, expertise: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expertise level" />
                </SelectTrigger>
                <SelectContent>
                  {expertiseLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Github className="w-5 h-5" />
              Social Links
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Profile</Label>
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-400" />
                <Input
                  id="github"
                  placeholder="username or https://github.com/username"
                  value={formData.github}
                  onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-500" />
                <Input
                  id="linkedin"
                  placeholder="username or https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentProject">Current Project</Label>
              <Input
                id="currentProject"
                placeholder="What are you working on right now?"
                value={formData.currentProject}
                onChange={(e) => setFormData(prev => ({ ...prev, currentProject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., Docker, AWS, GraphQL)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSubmitting ? "Creating Profile..." : "Join the Galaxy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};