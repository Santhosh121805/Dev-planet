import { useState, useEffect, useMemo } from "react";
import { Search, Github, Linkedin, Users, Code, Star, Zap, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Developer } from "@/lib/mockDevelopers";

interface MilkyWayProps {
  developers: Developer[];
  onOpenCreate?: () => void;
}

// Language/Framework color mapping
const languageColors = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Solidity: "#363636",
  Go: "#00add8",
  Java: "#ed8b00",
  Rust: "#ce422b",
  React: "#61dafb",
  Vue: "#4fc08d",
  Angular: "#dd0031",
  Django: "#092e20",
  FastAPI: "#009688",
  "Spring Boot": "#6db33f",
  Web3: "#f16822",
  TensorFlow: "#ff6f00",
  "Next.js": "#000000",
  Gin: "#00add8",
  Actix: "#ce422b",
  Hardhat: "#fff100"
};

interface Developer {
  id: number;
  name: string;
  primaryLanguage: string;
  framework: string;
  activityLevel: number;
  expertise: string;
  github: string;
  linkedin: string;
  projects: number;
  contributions: number;
  bio: string;
  currentProject: string;
}

interface DeveloperNodeProps {
  developer: Developer;
  isSelected: boolean;
  onSelect: (dev: Developer) => void;
  style: React.CSSProperties;
}

const DeveloperNode: React.FC<DeveloperNodeProps> = ({ developer, isSelected, onSelect, style }) => {
  const color = languageColors[developer.framework] || languageColors[developer.primaryLanguage] || "#6366f1";
  const size = Math.max(40, Math.min(80, developer.activityLevel * 0.8));
  
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${
        isSelected ? 'z-20' : 'z-10'
      }`}
      style={style}
      onClick={() => onSelect(developer)}
    >
      <div
        className={`rounded-full border-2 flex items-center justify-center relative ${
          isSelected ? 'animate-pulse' : ''
        }`}
        style={{
          width: size,
          height: size,
          backgroundColor: color + '20',
          borderColor: color,
          boxShadow: isSelected 
            ? `0 0 30px ${color}80, 0 0 50px ${color}40` 
            : `0 0 15px ${color}40`,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: color,
            opacity: 0.8
          }}
        />
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              opacity: 0.3
            }}
          />
        )}
      </div>
      
      {/* Developer name tooltip */}
      <div
        className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs text-white bg-gray-900 px-2 py-1 rounded transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
        }`}
      >
        {developer.name}
      </div>
    </div>
  );
};

export const MilkyWayGalaxy = ({ developers, onOpenCreate }: MilkyWayProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedExpertise, setSelectedExpertise] = useState("all");
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [followedDevelopers, setFollowedDevelopers] = useState<number[]>([]);

  // Filter developers
  const filteredDevelopers = useMemo(() => {
    return developers.filter(dev => {
      const matchesSearch = dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dev.primaryLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dev.framework.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLanguage = selectedLanguage === "all" || 
                             dev.primaryLanguage === selectedLanguage ||
                             dev.framework === selectedLanguage;
      
      const matchesExpertise = selectedExpertise === "all" || dev.expertise === selectedExpertise;
      
      return matchesSearch && matchesLanguage && matchesExpertise;
    });
  }, [developers, searchTerm, selectedLanguage, selectedExpertise]);

  // Generate positions for developers (galaxy layout)
  const developerPositions = useMemo(() => {
    const positions: { [key: number]: React.CSSProperties } = {};
    const centerX = 400;
    const centerY = 300;
    
    filteredDevelopers.forEach((dev, index) => {
      // Create galaxy spiral layout
      const angle = (index / filteredDevelopers.length) * Math.PI * 4;
      const radius = 50 + (index / filteredDevelopers.length) * 250;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      positions[dev.id] = {
        left: `${x}px`,
        top: `${y}px`,
      };
    });
    
    return positions;
  }, [filteredDevelopers]);

  const handleFollow = (developerId: number) => {
    setFollowedDevelopers(prev => 
      prev.includes(developerId) 
        ? prev.filter(id => id !== developerId)
        : [...prev, developerId]
    );
  };

  const uniqueLanguages = [...new Set(developers.flatMap(dev => [dev.primaryLanguage, dev.framework]))];
  const expertiseLevels = [...new Set(developers.map(dev => dev.expertise))];

  return (
    <div className="relative">
      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search developers, languages, or frameworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[200px] bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Language/Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technologies</SelectItem>
              {uniqueLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
            <SelectTrigger className="w-[150px] bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Expertise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {expertiseLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{filteredDevelopers.length} developers in orbit</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>{followedDevelopers.length} following</span>
            </div>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            onClick={() => onOpenCreate && onOpenCreate()}
          >
            <Code className="w-4 h-4 mr-2" />
            Join the Galaxy
          </Button>
        </div>
      </div>

      {/* Galaxy Container */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-black rounded-2xl overflow-hidden border border-purple-500/20"
           style={{ height: '600px' }}>
        
        {/* Animated background stars */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 150 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: `hsl(${Math.random() * 60 + 200}, 70%, 80%)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>

        {/* Galaxy spiral arms */}
        <div className="absolute inset-0">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from ${i * 120}deg, transparent 0deg, rgba(147, 51, 234, 0.1) 30deg, transparent 60deg)`,
                animation: `spin ${60 + i * 20}s linear infinite`
              }}
            />
          ))}
        </div>

        {/* Comet trails for activity */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: '2px',
                background: `linear-gradient(90deg, ${['#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#ffbe0b'][Math.floor(Math.random() * 5)]}, transparent)`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${Math.random() * 2 + 3}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>

        {/* Developer Nodes */}
        {filteredDevelopers.map(developer => (
          <DeveloperNode
            key={developer.id}
            developer={developer}
            isSelected={selectedDeveloper?.id === developer.id}
            onSelect={setSelectedDeveloper}
            style={developerPositions[developer.id] || { left: '50%', top: '50%' }}
          />
        ))}

        {/* Center Galaxy Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white/30">MilkyWay</h3>
            <p className="text-white/20">Developer Galaxy</p>
          </div>
        </div>
      </div>

      {/* Developer Profile Panel */}
      {selectedDeveloper && (
        <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
                style={{
                  backgroundColor: (languageColors[selectedDeveloper.framework] || languageColors[selectedDeveloper.primaryLanguage] || "#6366f1") + '20',
                  borderColor: languageColors[selectedDeveloper.framework] || languageColors[selectedDeveloper.primaryLanguage] || "#6366f1"
                }}
              >
                <Code className="w-8 h-8" style={{ 
                  color: languageColors[selectedDeveloper.framework] || languageColors[selectedDeveloper.primaryLanguage] || "#6366f1" 
                }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedDeveloper.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    style={{ 
                      backgroundColor: (languageColors[selectedDeveloper.primaryLanguage] || "#6366f1") + '20',
                      color: languageColors[selectedDeveloper.primaryLanguage] || "#6366f1"
                    }}
                  >
                    {selectedDeveloper.primaryLanguage}
                  </Badge>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: (languageColors[selectedDeveloper.framework] || "#6366f1") + '60',
                      color: languageColors[selectedDeveloper.framework] || "#6366f1"
                    }}
                  >
                    {selectedDeveloper.framework}
                  </Badge>
                  <Badge variant={selectedDeveloper.expertise === "Expert" ? "default" : "secondary"}>
                    {selectedDeveloper.expertise}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedDeveloper.github, '_blank')}
                className="border-gray-600 hover:bg-gray-700"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedDeveloper.linkedin, '_blank')}
                className="border-gray-600 hover:bg-gray-700"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant={followedDevelopers.includes(selectedDeveloper.id) ? "default" : "secondary"}
                size="sm"
                onClick={() => handleFollow(selectedDeveloper.id)}
              >
                <Star className={`w-4 h-4 mr-2 ${followedDevelopers.includes(selectedDeveloper.id) ? 'fill-current' : ''}`} />
                {followedDevelopers.includes(selectedDeveloper.id) ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">{selectedDeveloper.bio}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Project:</span>
                  <span className="text-white font-medium">{selectedDeveloper.currentProject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projects:</span>
                  <span className="text-purple-300">{selectedDeveloper.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contributions:</span>
                  <span className="text-green-300">{selectedDeveloper.contributions}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Activity Level</span>
                  <span className="text-blue-300">{selectedDeveloper.activityLevel}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${selectedDeveloper.activityLevel}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Invite to Project
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 hover:bg-gray-700">
                  <Users className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};