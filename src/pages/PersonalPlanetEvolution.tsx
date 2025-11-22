import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import personalPlanet from "@/assets/personal-planet.jpg";
import { Sparkles, Code2, Trophy, Zap, Clock, CheckCircle, Play, Pause, RotateCcw, AlertCircle, Target } from "lucide-react";

// Mock types for now - will use real hook later
interface CodeMetrics {
  lines: number;
  functions: number;
  comments: number;
  complexity: number;
  language: string;
}

interface CodeAnalysis {
  evolution_points: number;
  complexity_score: number;
  style_feedback: string;
  suggestions: string[];
  timestamp: string;
}

interface SessionStats {
  sessions_today: number;
  total_achievements: number;
  total_evolution_points: number;
  current_streak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

interface SolutionReport {
  challengeId: string;
  challengeTitle: string;
  timeSpent: number;
  codeLength: number;
  language: string;
  approach: string;
  efficiency: {
    timeComplexity: string;
    spaceComplexity: string;
    rating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  };
  strengths: string[];
  improvements: string[];
  score: number;
  feedback: string;
}

// Real-time analysis hook with backend API
function useRealTimeAnalysis() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<CodeAnalysis | null>({
    evolution_points: 0,
    complexity_score: 1,
    style_feedback: 'ready-to-code',
    suggestions: ['🚀 Connecting to Planet Forge API...'],
    timestamp: new Date().toISOString()
  });
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    sessions_today: 0,
    total_achievements: 0,
    total_evolution_points: 0,
    current_streak: 0
  });
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  // API base URL
  const API_BASE = 'http://localhost:8000/api';

  // Test backend connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          setIsConnected(true);
        }
      } catch (error) {
        console.log('Backend not available, using local analysis');
        setIsConnected(false);
      }
    };
    testConnection();
  }, []);

  const startSession = async () => {
    setSessionActive(true);
    try {
      if (isConnected) {
        // TODO: Call backend session start API
        console.log('Starting session with backend');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    setSessionActive(false);
    try {
      if (isConnected) {
        // TODO: Call backend session end API
        console.log('Ending session with backend');
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const sendCodeAnalysis = async (metrics: CodeMetrics, codeText: string = '') => {
    console.log('🔥 Real-time analysis for code:', codeText.substring(0, 50) + '...');
    
    try {
      if (isConnected && codeText.trim()) {
        // Call real backend API
        const response = await fetch(`${API_BASE}/genome/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: codeText,
            language: metrics.language,
            metrics: {
              lines: metrics.lines,
              functions: metrics.functions,
              comments: metrics.comments,
              complexity: metrics.complexity
            }
          })
        });

        if (response.ok) {
          const analysisData = await response.json();
          
          // Transform backend response to our format
          setLatestAnalysis({
            evolution_points: analysisData.evolution_points || Math.floor(codeText.length / 10),
            complexity_score: analysisData.complexity_score || Math.min(10, metrics.complexity),
            style_feedback: analysisData.style_feedback || 'backend-analyzed',
            suggestions: analysisData.suggestions || [
              '🧠 Backend analysis complete!',
              `✨ Code quality: ${analysisData.quality || 'Good'}`,
              `🚀 Evolution: +${analysisData.evolution_points || 10} points`
            ],
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
      
      // Fallback to local analysis if backend fails or not connected
      performLocalAnalysis(codeText, metrics);
      
    } catch (error) {
      console.error('API call failed, using local analysis:', error);
      performLocalAnalysis(codeText, metrics);
    }
  };

  const performLocalAnalysis = (codeText: string, metrics: CodeMetrics) => {
    // Enhanced local analysis as fallback
    const hasGoodStructure = codeText.includes('function') || codeText.includes('def ') || codeText.includes('=>') || codeText.includes('class ');
    const hasComments = codeText.includes('//') || codeText.includes('#') || codeText.includes('/*');
    const hasOptimization = codeText.includes('for') || codeText.includes('while') || codeText.includes('map') || codeText.includes('reduce');
    const hasErrorHandling = codeText.includes('try') || codeText.includes('catch') || codeText.includes('except');
    const hasAsync = codeText.includes('async') || codeText.includes('await') || codeText.includes('Promise');
    
    const codeLength = codeText.length;
    const lineCount = codeText.split('\n').length;
    
    let suggestions = [];
    let styleScore = 'local-analysis';
    let evolutionPoints = 0;
    let complexityScore = 1;
    
    // Dynamic analysis based on code content
    if (codeLength === 0) {
      suggestions = ['🎯 Start coding to see your planet evolve!'];
      styleScore = 'empty';
      evolutionPoints = 0;
      complexityScore = 0;
    } else if (codeLength < 50) {
      suggestions = ['🌱 Great start! Your planet is beginning to form...'];
      styleScore = 'embryonic';
      evolutionPoints = Math.max(1, Math.floor(codeLength / 5));
      complexityScore = 1;
    } else {
      suggestions = ['⚡ Local analysis: Your code is taking shape!'];
      styleScore = 'developing';
      evolutionPoints = Math.floor(codeLength / 3);
      complexityScore = Math.min(8, Math.floor(codeLength / 15));
    }
    
    // Feature detection bonuses
    if (hasGoodStructure) {
      suggestions.push('🏗️ Excellent code structure detected!');
      evolutionPoints += 10;
      complexityScore += 2;
    }
    
    if (hasComments) {
      suggestions.push('📚 Great documentation! Clean code wins!');
      evolutionPoints += 8;
      complexityScore += 1;
    }
    
    if (hasOptimization) {
      suggestions.push('⚡ Efficient algorithms detected!');
      evolutionPoints += 12;
      complexityScore += 3;
    }
    
    if (hasErrorHandling) {
      suggestions.push('🛡️ Robust error handling! Well done!');
      evolutionPoints += 15;
      complexityScore += 2;
    }
    
    if (hasAsync) {
      suggestions.push('🚀 Async patterns found! Modern coding!');
      evolutionPoints += 10;
      complexityScore += 2;
    }
    
    // Cap the values
    evolutionPoints = Math.min(100, Math.max(0, evolutionPoints));
    complexityScore = Math.min(10, Math.max(0, complexityScore));
    
    setLatestAnalysis({
      evolution_points: evolutionPoints,
      complexity_score: complexityScore,
      style_feedback: styleScore,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });
  };

  return {
    isConnected,
    sessionActive,
    sessionStats,
    latestAnalysis,
    recentAchievements,
    startSession,
    endSession,
    sendCodeAnalysis
  };
}

interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  prompt: string;
  languages: string[];
  expectedConcepts: string[];
  timeLimit?: number;
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
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [solutionReport, setSolutionReport] = useState<SolutionReport | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const {
    isConnected,
    sessionActive,
    sessionStats,
    latestAnalysis,
    recentAchievements,
    startSession,
    endSession,
    sendCodeAnalysis
  } = useRealTimeAnalysis();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Real-time code analysis - triggers on any code change
  useEffect(() => {
    if (code.trim()) {
      // Immediate analysis for short delays (more responsive)
      const analysisTimer = setTimeout(() => {
        analyzeCode();
      }, 100); // Further reduced from 300ms to 100ms for instant response
      return () => clearTimeout(analysisTimer);
    } else if (code.length === 0) {
      // Reset analysis when code is cleared
      sendCodeAnalysis({
        lines: 0,
        functions: 0,
        comments: 0,
        complexity: 1,
        language: language
      }, '');
    }
  }, [code]); // Removed selectedChallenge dependency to work even without challenge

  const selectChallenge = (challenge: CodingChallenge) => {
    setSelectedChallenge(challenge);
    setCode(`// Write your ${language} solution here...\n`);
    setTimeLeft(challenge.timeLimit ? challenge.timeLimit * 60 : null);
    setIsTimerRunning(false);
    setSessionStarted(false);
    setIsEditorOpen(true);
  };

  const startCodingSession = () => {
    if (!sessionStarted && selectedChallenge) {
      setSessionStarted(true);
      setIsTimerRunning(true);
      setStartTime(Date.now());
      startSession();
      
      // Show immediate analyzer connection feedback
      setTimeout(() => {
        sendCodeAnalysis({
          lines: 1,
          functions: 0,
          comments: 0,
          complexity: 1,
          language: language
        }, code);
      }, 500);
    }
  };

  const analyzeCode = () => {
    if (!code.trim()) return;
    
    const lines = code.split('\n').length;
    const functions = (code.match(/function|def |const \w+\s*=|class /g) || []).length;
    const comments = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
    const complexity = Math.min(10, Math.max(1, code.length / 50));

    sendCodeAnalysis({ lines, functions, comments, complexity, language }, code);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (sessionActive) {
      endSession();
    }
    
    // Generate comprehensive solution report
    const report = generateSolutionReport();
    setSolutionReport(report);
    setIsEditorOpen(false);
    setIsReportOpen(true);
  };

  const generateSolutionReport = (): SolutionReport => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const codeLines = code.split('\n').filter(line => line.trim()).length;
    
    // Analyze solution approach
    const approach = analyzeApproach(code, language);
    const efficiency = analyzeEfficiency(code, language);
    const { strengths, improvements, score } = evaluateSolution(code, language, selectedChallenge);
    
    return {
      challengeId: selectedChallenge?.id || 'unknown',
      challengeTitle: selectedChallenge?.title || 'Unknown Challenge',
      timeSpent,
      codeLength: code.length,
      language,
      approach,
      efficiency,
      strengths,
      improvements,
      score,
      feedback: generateFeedback(score, timeSpent, efficiency.rating)
    };
  };

  const analyzeApproach = (code: string, language: string): string => {
    // Detect programming patterns and approaches
    const patterns = [];
    
    if (code.includes('for') || code.includes('while')) patterns.push('Iterative');
    if (code.includes('return') && (code.match(/return/g) || []).length > 1) patterns.push('Recursive');
    if (code.includes('map') || code.includes('filter') || code.includes('reduce')) patterns.push('Functional');
    if (code.includes('class') || code.includes('this.')) patterns.push('Object-Oriented');
    if (code.includes('async') || code.includes('await') || code.includes('Promise')) patterns.push('Asynchronous');
    if (code.includes('import') || code.includes('require')) patterns.push('Modular');
    
    return patterns.length > 0 ? patterns.join(' + ') : 'Procedural';
  };

  const analyzeEfficiency = (code: string, language: string) => {
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';
    let rating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' = 'Good';
    
    // Simple complexity analysis
    const nestedLoops = (code.match(/for[\s\S]*?for/g) || []).length;
    const singleLoops = (code.match(/for|while/g) || []).length - nestedLoops;
    const recursiveCalls = (code.match(/return[\s\S]*?\(/g) || []).length;
    
    if (nestedLoops > 1) {
      timeComplexity = 'O(n³)';
      rating = 'Needs Improvement';
    } else if (nestedLoops === 1) {
      timeComplexity = 'O(n²)';
      rating = 'Average';
    } else if (singleLoops > 0) {
      timeComplexity = 'O(n)';
      rating = 'Good';
    } else if (recursiveCalls > 2) {
      timeComplexity = 'O(2^n)';
      rating = 'Needs Improvement';
    } else {
      rating = 'Excellent';
    }
    
    // Space complexity analysis
    if (code.includes('Array') || code.includes('[]') || code.includes('{}')) {
      spaceComplexity = 'O(n)';
    }
    
    return { timeComplexity, spaceComplexity, rating };
  };

  const evaluateSolution = (code: string, language: string, challenge: CodingChallenge | null) => {
    const strengths = [];
    const improvements = [];
    let score = 50; // Base score
    
    // Check for best practices
    if (code.includes('//') || code.includes('#') || code.includes('/*')) {
      strengths.push('Well-commented code');
      score += 15;
    } else {
      improvements.push('Add comments to explain your logic');
    }
    
    if (code.includes('function') || code.includes('def ') || code.includes('=>')) {
      strengths.push('Good function structure');
      score += 10;
    }
    
    if (code.includes('const') || code.includes('let') || code.includes('var')) {
      strengths.push('Proper variable declarations');
      score += 5;
    }
    
    if (code.includes('try') || code.includes('catch') || code.includes('except')) {
      strengths.push('Error handling implemented');
      score += 15;
    } else {
      improvements.push('Consider adding error handling');
    }
    
    // Code length assessment
    const lines = code.split('\n').filter(line => line.trim()).length;
    if (lines < 10) {
      strengths.push('Concise solution');
      score += 10;
    } else if (lines > 50) {
      improvements.push('Consider refactoring for better readability');
      score -= 5;
    }
    
    // Algorithm efficiency check
    if (!code.includes('for') || code.includes('map') || code.includes('filter')) {
      strengths.push('Efficient algorithm choice');
      score += 10;
    }
    
    return {
      strengths,
      improvements: improvements.length > 0 ? improvements : ['Great job! Consider exploring alternative approaches'],
      score: Math.max(0, Math.min(100, score))
    };
  };

  const generateFeedback = (score: number, timeSpent: number, efficiency: string): string => {
    if (score >= 85) {
      return `Excellent work! Your solution demonstrates strong problem-solving skills and coding best practices. Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;
    } else if (score >= 70) {
      return `Good solution! You've got the fundamentals right. With some optimization, you could achieve even better results. Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;
    } else if (score >= 50) {
      return `Nice effort! Your solution works, but there's room for improvement in efficiency and code quality. Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;
    } else {
      return `Keep practicing! Focus on code structure, efficiency, and best practices. Every challenge makes you stronger. Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <Navigation onLoginClick={() => setIsLoginOpen(true)} />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Planet Display */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <img
                src={personalPlanet}
                alt="Personal Planet"
                className="w-80 h-80 rounded-full shadow-2xl mx-auto object-cover border-4 border-purple-400 glow"
              />
              {recentAchievements && recentAchievements.length > 0 && (
                <div className="absolute -top-4 -right-4 animate-bounce">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    New Achievement!
                  </div>
                </div>
              )}
              
              {sessionActive && (
                <div className="absolute bottom-4 left-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    Evolving...
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white mb-2">
                Your Coding Planet
              </h1>
              <p className="text-purple-200 text-lg">
                Level up through coding challenges with real-time feedback
              </p>
              
              {sessionStats && (
                <div className="bg-gray-800/50 rounded-lg p-4 mx-auto max-w-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{sessionStats.sessions_today}</div>
                      <div className="text-sm text-gray-300">Sessions Today</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{sessionStats.total_achievements}</div>
                      <div className="text-sm text-gray-300">Achievements</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Challenge Selection */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-6 h-6 text-purple-400" />
                Coding Challenges
              </h2>
              
              <div className="grid gap-3">
                {CODING_CHALLENGES.map((challenge) => (
                  <div
                    key={challenge.id}
                    onClick={() => selectChallenge(challenge)}
                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-400 
                             transition-all cursor-pointer group hover:bg-gray-700/70 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white group-hover:text-purple-300">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={challenge.difficulty === "easy" ? "secondary" : 
                                   challenge.difficulty === "medium" ? "default" : "destructive"}
                        >
                          {challenge.difficulty}
                        </Badge>
                        {challenge.timeLimit && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {challenge.timeLimit}m
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Target className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-300">
                        Concepts: {challenge.expectedConcepts.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Connection Status */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  <span className="text-gray-300">
                    {isConnected ? 'Real-time analysis active' : 'Connecting...'}
                  </span>
                </div>
                {sessionActive && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Session Active
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Coding Challenge Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl text-white flex items-center gap-2">
                  {selectedChallenge?.title}
                  <Badge variant={selectedChallenge?.difficulty === "easy" ? "secondary" : 
                                 selectedChallenge?.difficulty === "medium" ? "default" : "destructive"}>
                    {selectedChallenge?.difficulty}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-gray-300 mt-2">
                  {selectedChallenge?.prompt}
                </DialogDescription>
              </div>
              
              {/* Timer and Controls */}
              <div className="flex items-center gap-3">
                {timeLeft !== null && (
                  <div className="text-right">
                    <div className={`text-2xl font-mono font-bold ${
                      timeLeft < 120 ? 'text-red-400 animate-pulse' : 
                      timeLeft < 300 ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs text-gray-400">Time Left</div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {!sessionStarted ? (
                    <Button onClick={startCodingSession} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <Button onClick={() => setIsTimerRunning(!isTimerRunning)} variant="outline" size="sm">
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            {/* Problem Statement */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  Description
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedChallenge?.description}
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  Expected Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedChallenge?.expectedConcepts.map((concept) => (
                    <Badge key={concept} variant="outline" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Real-time Progress */}
              {latestAnalysis && (
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Real-time Analysis
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Evolution Points:</span>
                      <span className="text-green-400 font-mono">{latestAnalysis.evolution_points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Code Quality:</span>
                      <span className="text-green-400 font-mono">{latestAnalysis.complexity_score}/10</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                    <Button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      variant={language === lang ? "default" : "outline"}
                      size="sm"
                      className="capitalize"
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
                
                {latestAnalysis && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400">Live Analysis</span>
                    </div>
                    <div className="text-gray-300">
                      Score: <span className="text-purple-400 font-mono font-bold">
                        {latestAnalysis.evolution_points}pts
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4 h-96 relative border-2 border-gray-700 focus-within:border-purple-500 transition-colors">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Write your ${language} solution here...\n// Your planet evolves in real-time based on your coding patterns!`}
                  className="w-full h-full font-mono text-sm bg-transparent border-none resize-none 
                           focus:ring-0 text-gray-100 placeholder-gray-500 leading-relaxed"
                />
                
                {/* Real-time indicators */}
                {latestAnalysis && code.length > 50 && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {latestAnalysis.style_feedback.includes('clean') && (
                      <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1 animate-pulse">
                        <CheckCircle className="w-3 h-3" />
                        Clean Code
                      </div>
                    )}
                    {latestAnalysis.complexity_score > 7 && (
                      <div className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        High Complexity
                      </div>
                    )}
                    {(code.match(/function|def |const \w+\s*=/g) || []).length > 0 && (
                      <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                        Function Detected
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400 space-x-4">
                  <span>Lines: <strong className="text-white">{code.split('\n').length}</strong></span>
                  <span>Chars: <strong className="text-white">{code.length}</strong></span>
                  <span>Functions: <strong className="text-white">{(code.match(/function|def |const \w+\s*=|class /g) || []).length}</strong></span>
                  {latestAnalysis && (
                    <span>Score: <strong className="text-purple-400">{latestAnalysis.evolution_points}pts</strong></span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsEditorOpen(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!code.trim() || code.length < 20}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Submit & Evolve Planet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Solution Report Modal */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Challenge Complete!
              <Badge className="bg-green-600 text-white px-3 py-1">
                Score: {solutionReport?.score}/100
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {solutionReport?.challengeTitle} - Solution Analysis Report
            </DialogDescription>
          </DialogHeader>

          {solutionReport && (
            <div className="space-y-6 mt-6">
              {/* Performance Summary */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Performance Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.floor(solutionReport.timeSpent / 60)}m {solutionReport.timeSpent % 60}s
                    </div>
                    <div className="text-xs text-gray-300">Time Spent</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{solutionReport.codeLength}</div>
                    <div className="text-xs text-gray-300">Characters</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-400">{solutionReport.approach}</div>
                    <div className="text-xs text-gray-300">Approach</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl font-bold text-yellow-400">{solutionReport.language}</div>
                    <div className="text-xs text-gray-300">Language</div>
                  </div>
                </div>
              </div>

              {/* Efficiency Analysis */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Efficiency Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Time Complexity:</span>
                    <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/30">
                      {solutionReport.efficiency.timeComplexity}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Space Complexity:</span>
                    <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30">
                      {solutionReport.efficiency.spaceComplexity}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Efficiency Rating:</span>
                    <Badge className={`px-3 py-1 ${
                      solutionReport.efficiency.rating === 'Excellent' ? 'bg-green-600 text-white' :
                      solutionReport.efficiency.rating === 'Good' ? 'bg-blue-600 text-white' :
                      solutionReport.efficiency.rating === 'Average' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {solutionReport.efficiency.rating}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-green-900/20 rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <div className="space-y-3">
                    {solutionReport.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-green-800/20 rounded border-l-3 border-green-400">
                        <span className="text-green-400 text-sm mt-0.5">✅</span>
                        <span className="text-sm text-green-100">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-orange-900/20 rounded-xl p-6 border border-orange-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-3">
                    {solutionReport.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-orange-800/20 rounded border-l-3 border-orange-400">
                        <span className="text-orange-400 text-sm mt-0.5">💡</span>
                        <span className="text-sm text-orange-100">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/20 rounded-xl p-6 border border-purple-500/40">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Planet Oracle Feedback
                </h3>
                <div className="p-4 bg-purple-800/20 rounded border-l-4 border-purple-400">
                  <p className="text-purple-100">{solutionReport.feedback}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setIsReportOpen(false)}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Continue Planet Evolution
                </Button>
                <Button 
                  onClick={() => {
                    setIsReportOpen(false);
                    setCode('');
                    setSessionStarted(false);
                    setIsEditorOpen(true);
                  }}
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Another Challenge
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}