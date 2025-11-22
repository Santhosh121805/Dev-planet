import { useState, useEffect } from "react";
import { Sparkles, Code2, RefreshCw, Zap, Palette, Play, Square, Activity, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRealTimeAnalysis, CodeMetrics } from "@/hooks/useRealTimeAnalysis";

interface Trait {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const AnalyzerPanel = () => {
  const [userId] = useState("demo_user"); // In real app, get from auth context
  const [planetId] = useState("demo_planet_id");
  const [codeInput, setCodeInput] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  const {
    isConnected,
    sessionActive,
    sessionStats,
    latestAnalysis,
    recentAchievements,
    startSession,
    endSession,
    sendCodeAnalysis
  } = useRealTimeAnalysis(userId);

  // Convert analysis to display traits
  const getTraitsFromAnalysis = () => {
    if (!latestAnalysis) {
      return [
        { name: "Algorithm Mastery", value: 0, icon: <Sparkles className="w-4 h-4" />, color: "hsl(270, 50%, 50%)" },
        { name: "Code Documentation", value: 0, icon: <Code2 className="w-4 h-4" />, color: "hsl(16, 100%, 61%)" },
        { name: "System Design", value: 0, icon: <RefreshCw className="w-4 h-4" />, color: "hsl(200, 70%, 60%)" },
        { name: "Problem Solving", value: 0, icon: <Zap className="w-4 h-4" />, color: "hsl(280, 60%, 55%)" },
        { name: "Code Quality", value: 0, icon: <Palette className="w-4 h-4" />, color: "hsl(16, 100%, 61%)" },
      ];
    }

    const skills = latestAnalysis.skill_deltas;
    return [
      { 
        name: "Algorithm Mastery", 
        value: Math.min(100, (skills.algorithm_mastery || 0) * 10), 
        icon: <Sparkles className="w-4 h-4" />, 
        color: "hsl(270, 50%, 50%)" 
      },
      { 
        name: "Web Development", 
        value: Math.min(100, (skills.web_development_skill || 0) * 10), 
        icon: <Code2 className="w-4 h-4" />, 
        color: "hsl(16, 100%, 61%)" 
      },
      { 
        name: "API Design", 
        value: Math.min(100, (skills.api_design_discipline || 0) * 10), 
        icon: <RefreshCw className="w-4 h-4" />, 
        color: "hsl(200, 70%, 60%)" 
      },
      { 
        name: "DevOps Maturity", 
        value: Math.min(100, (skills.devops_maturity || 0) * 10), 
        icon: <Zap className="w-4 h-4" />, 
        color: "hsl(280, 60%, 55%)" 
      },
      { 
        name: "Security Awareness", 
        value: Math.min(100, (skills.security_awareness || 0) * 10), 
        icon: <Palette className="w-4 h-4" />, 
        color: "hsl(16, 100%, 61%)" 
      },
    ];
  };

  const traits = getTraitsFromAnalysis();
  const hasAnalyzedCode = latestAnalysis !== null;

  // Simulate code analysis
  const analyzeCode = () => {
    const lines = codeInput.split('\n').length;
    const functions = (codeInput.match(/function|def |const \w+\s*=/g) || []).length;
    const comments = (codeInput.match(/\/\/|\/\*|\*/g) || []).length;
    const complexity = Math.min(10, Math.max(1, codeInput.length / 100));

    const metrics: CodeMetrics = {
      lines,
      functions,
      comments,
      complexity,
      language
    };

    sendCodeAnalysis(metrics);
  };

  const handleStartSession = () => {
    startSession({
      planet_id: planetId,
      project_name: "Live Coding Session",
      language: language
    });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-8 glow-subtle">
      <div className="text-center space-y-6">
        <div className="inline-block">
          <div className="text-section text-muted-foreground mb-2">The Analyzer</div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Your Code Signature</h2>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? '🟢 Connected to Planet Forge' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Session Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={sessionActive ? endSession : handleStartSession}
            variant={sessionActive ? "destructive" : "default"}
            size="sm"
            disabled={!isConnected}
          >
            {sessionActive ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {sessionActive ? 'End Session' : 'Start Session'}
          </Button>
          
          {sessionActive && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {Math.floor(sessionStats.duration / 60)}m {sessionStats.duration % 60}s
            </Badge>
          )}
        </div>

        {/* Live Code Analysis */}
        {sessionActive && (
          <div className="max-w-md mx-auto space-y-4 mb-6">
            <div className="flex gap-2">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <Button onClick={analyzeCode} disabled={!codeInput.trim()}>
                Analyze
              </Button>
            </div>
            
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste your code here for real-time analysis..."
              className="w-full h-32 p-3 bg-background border border-border rounded-lg text-sm font-mono resize-none"
            />
          </div>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Achievements
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentAchievements.slice(0, 3).map((achievement, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <span>{achievement.icon}</span>
                  <span>{achievement.title}</span>
                  <span className="text-yellow-500">+{achievement.points}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!hasAnalyzedCode ? (
          <div className="max-w-2xl mx-auto py-12">
            <p className="text-muted-foreground italic text-lg">
              The Analyzer is listening...
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Start a session and analyze code to awaken your planet.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Coding Style: <Badge variant="outline">{latestAnalysis?.coding_style}</Badge>
              </span>
              <span className="text-sm text-muted-foreground">
                Evolution Points: <span className="text-primary font-bold">+{latestAnalysis?.evolution_points.toFixed(1)}</span>
              </span>
            </div>
            
            {traits.map((trait) => (
              <div key={trait.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div style={{ color: trait.color }}>{trait.icon}</div>
                    <span className="text-foreground font-medium">{trait.name}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">{trait.value.toFixed(0)}%</span>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-cosmic"
                    style={{ 
                      width: `${trait.value}%`,
                      backgroundColor: trait.color,
                      boxShadow: `0 0 10px ${trait.color}`
                    }}
                  />
                </div>
              </div>
            ))}

            <p className="text-muted-foreground italic max-w-md mx-auto mt-8">
              "Every line you write reshapes your world."
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
