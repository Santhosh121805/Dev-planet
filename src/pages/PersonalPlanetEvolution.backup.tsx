import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealTimeAnalysis, CodeMetrics } from "@/hooks/useRealTimeAnalysis";
import personalPlanet from "@/assets/personal-planet.jpg";
import { Sparkles, Code2, Trophy, Zap, Clock, CheckCircle, Play, Pause, RotateCcw, AlertCircle, Target } from "lucide-react";

interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  prompt: string;
  languages: string[];
  expectedConcepts: string[];
  timeLimit?: number; // in minutes
  hints: string[];
}

const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: "array-sum",
    title: "Array Sum Challenge",
    difficulty: "easy",
    description: "Calculate the sum of all elements in an array",
    prompt: "Write a function that takes an array of numbers and returns their sum. Your planet will evolve based on your coding style and approach.",
    languages: ["javascript", "python", "java", "cpp"],
    expectedConcepts: ["loops", "arrays", "functions"],
    timeLimit: 10,
    hints: [
      "You can use a loop to iterate through the array",
      "Consider using built-in methods like reduce() in JavaScript",
      "Think about edge cases like empty arrays"
    ]
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence",
    difficulty: "medium", 
    description: "Generate the fibonacci sequence up to n terms",
    prompt: "Write a function that generates the first n numbers in the Fibonacci sequence. Your planet's evolution will reflect your problem-solving approach.",
    languages: ["javascript", "python", "java", "cpp"],
    expectedConcepts: ["recursion", "iteration", "dynamic programming"],
    timeLimit: 15,
    hints: [
      "You can solve this recursively or iteratively",
      "Consider memoization for optimization",
      "Think about the base cases for n=0 and n=1"
    ]
  },
  {
    id: "string-reversal",
    title: "String Manipulation Master",
    difficulty: "easy",
    description: "Reverse a string without using built-in reverse methods",
    prompt: "Create a function that reverses a string character by character. Your coding patterns will influence your planet's terrain.",
    languages: ["javascript", "python", "java", "cpp"],
    expectedConcepts: ["strings", "loops", "algorithms"],
    timeLimit: 8,
    hints: [
      "You can use a loop to iterate backwards",
      "Try converting to array first",
      "Consider the two-pointer approach"
    ]
  },
  {
    id: "prime-checker",
    title: "Prime Number Detective",
    difficulty: "medium",
    description: "Determine if a number is prime",
    prompt: "Write an efficient function to check if a given number is prime. Your algorithm efficiency will affect your planet's atmosphere.",
    languages: ["javascript", "python", "java", "cpp"],
    expectedConcepts: ["algorithms", "optimization", "math"],
    timeLimit: 12,
    hints: [
      "You only need to check up to square root of n",
      "Handle edge cases for numbers less than 2",
      "Consider the efficiency of your algorithm"
    ]
  },
  {
    id: "binary-search",
    title: "Search Algorithm Champion",
    difficulty: "hard",
    description: "Implement binary search on a sorted array",
    prompt: "Create a binary search function that finds a target value in a sorted array. Your approach will determine your planet's special features.",
    languages: ["javascript", "python", "java", "cpp"],
    expectedConcepts: ["algorithms", "binary search", "efficiency"],
    timeLimit: 20,
    hints: [
      "Remember the array must be sorted",
      "Use divide and conquer approach",
      "Be careful with integer overflow in some languages"
    ]
  }
];

export default function PersonalPlanetEvolution() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  
  const userId = "demo_user"; // In real app, get from auth context
  const planetId = "evolution_planet";
  
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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            setIsTimerRunning(false);
            handleTimeUp();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Real-time code analysis
  useEffect(() => {
    if (code && sessionActive && selectedChallenge) {
      const analysisTimer = setTimeout(() => {
        analyzeCode();
      }, 1000); // Analyze after 1 second of no typing

      return () => clearTimeout(analysisTimer);
    }
  }, [code, sessionActive]);

  const selectChallenge = (challenge: CodingChallenge) => {
    setSelectedChallenge(challenge);
    setCode("");
    setTimeLeft(challenge.timeLimit ? challenge.timeLimit * 60 : null);
    setIsTimerRunning(false);
    setSessionStarted(false);
    setShowHints(false);
    setIsEditorOpen(true);
  };

  const startCodingSession = () => {
    if (!sessionStarted) {
      setSessionStarted(true);
      setIsTimerRunning(true);
      
      startSession({
        planet_id: planetId,
        project_name: selectedChallenge?.title || "Coding Challenge",
        language: language
      });
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetChallenge = () => {
    setCode("");
    setTimeLeft(selectedChallenge?.timeLimit ? selectedChallenge.timeLimit * 60 : null);
    setIsTimerRunning(false);
    setSessionStarted(false);
    setShowHints(false);
  };

  const analyzeCode = () => {
    if (!code.trim()) return;

    const lines = code.split('\n').length;
    const functions = (code.match(/function|def |const \w+\s*=|class /g) || []).length;
    const comments = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
    const complexity = Math.min(10, Math.max(1, code.length / 100));

    const metrics: CodeMetrics = {
      lines,
      functions,
      comments,
      complexity,
      language
    };

    sendCodeAnalysis(metrics);
  };

  const handleTimeUp = () => {
    if (sessionActive) {
      endSession();
    }
    // Auto-submit or show time up message
  };

  const handleSubmit = () => {
    if (sessionActive) {
      endSession();
    }
    setIsEditorOpen(false);
    // Process final submission
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSkillProgress = () => {
    if (!latestAnalysis) return 0;
    return Math.min(100, latestAnalysis.evolution_points * 10);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block">
            <div className="text-section text-muted-foreground mb-2">Your Journey</div>
            <h1 className="text-hero text-foreground">Personal Planet Evolution</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your planet learns from every thought you write.
          </p>
        </div>

        {/* Planet Showcase */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="rounded-2xl bg-card border border-border p-12 glow-subtle">
            <div className="relative w-80 h-80 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-pulse" />
              <img 
                src={personalPlanet} 
                alt="Your Personal Planet"
                className="relative w-full h-full object-cover rounded-full animate-[spin_60s_linear_infinite]"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Planet Ignis</h2>
              <p className="text-muted-foreground italic">
                The land sleeps… feed it with logic.
              </p>
            </div>
          </div>
        </div>

        {/* Evolution Engine */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="rounded-2xl bg-card border border-border p-8 glow-subtle text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold text-foreground mb-4">Evolution Engine</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Write code to awaken this world. Your creativity shapes the planet's destiny.
            </p>
            <Button 
              onClick={() => setIsEditorOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold px-8 py-6 text-lg glow-primary"
            >
              Use It to Evolve
            </Button>
          </div>
        </div>

        {/* Evolution Log - Empty State */}
        {!hasSubmitted && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="text-section text-muted-foreground">Evolution Log</div>
              <h3 className="text-2xl font-bold text-foreground">Awaiting First Code</h3>
              <p className="text-muted-foreground italic max-w-md mx-auto">
                Your evolution story will begin once you submit your first code.
              </p>
            </div>
          </div>
        )}

        {/* Evolution Log - After Submission */}
        {hasSubmitted && (
          <div className="max-w-4xl mx-auto">
            <div className="text-section text-muted-foreground mb-4">Evolution Log</div>
            <div className="rounded-2xl bg-card border border-border p-8 glow-subtle">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse" />
                  <div>
                    <p className="text-foreground font-medium mb-2">The Analyzer has sensed something…</p>
                    <p className="text-sm text-muted-foreground">
                      Your creativity ripple may form floating islands.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Code Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Submit Your Code</DialogTitle>
            <DialogDescription>
              Paste or write any code from any language. The Analyzer will study your style.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Your code here..."
              className="min-h-[300px] font-mono"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!code.trim()}>
                Analyze & Evolve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
