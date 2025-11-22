import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  Building, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  Clock,
  Zap,
  AlertTriangle,
  Cloud,
  Server,
  Database,
  Shield
} from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  type: "build" | "test" | "security" | "deploy";
  duration: number;
  logs: string[];
  requirements: string[];
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  environment: "development" | "staging" | "production";
  stages: PipelineStage[];
  isCompleted: boolean;
  lastRun: Date | null;
  successRate: number;
  position: { x: number; y: number };
}

interface InfrastructureTower {
  id: string;
  name: string;
  type: "compute" | "storage" | "network" | "monitoring";
  level: number; // 1-5
  isActive: boolean;
  capacity: number;
  usage: number;
  position: { x: number; y: number };
}

const PIPELINES: Pipeline[] = [
  {
    id: "frontend-ci",
    name: "Frontend CI/CD",
    description: "Deploy React application with testing and optimization",
    difficulty: "easy",
    environment: "development",
    isCompleted: false,
    lastRun: null,
    successRate: 0,
    position: { x: 20, y: 25 },
    stages: [
      {
        id: "install",
        name: "Install Dependencies",
        status: "pending",
        type: "build",
        duration: 0,
        logs: [],
        requirements: ["package.json exists", "Node.js 18+"]
      },
      {
        id: "lint",
        name: "Lint & Format",
        status: "pending",
        type: "test",
        duration: 0,
        logs: [],
        requirements: ["ESLint configured", "Prettier setup"]
      },
      {
        id: "test",
        name: "Run Tests",
        status: "pending",
        type: "test",
        duration: 0,
        logs: [],
        requirements: ["Test files exist", "Jest configured"]
      },
      {
        id: "build",
        name: "Build Production",
        status: "pending",
        type: "build",
        duration: 0,
        logs: [],
        requirements: ["Vite/Webpack config", "Environment variables"]
      },
      {
        id: "deploy",
        name: "Deploy to Vercel",
        status: "pending",
        type: "deploy",
        duration: 0,
        logs: [],
        requirements: ["Vercel token", "Domain configured"]
      }
    ]
  },
  {
    id: "backend-api",
    name: "Backend API Pipeline",
    description: "Deploy Node.js API with database migrations",
    difficulty: "medium",
    environment: "staging",
    isCompleted: false,
    lastRun: null,
    successRate: 0,
    position: { x: 50, y: 35 },
    stages: [
      {
        id: "dependencies",
        name: "Install Dependencies",
        status: "pending",
        type: "build",
        duration: 0,
        logs: [],
        requirements: ["package.json", "Node.js 20+"]
      },
      {
        id: "security-scan",
        name: "Security Scan",
        status: "pending",
        type: "security",
        duration: 0,
        logs: [],
        requirements: ["npm audit", "OWASP scan"]
      },
      {
        id: "unit-tests",
        name: "Unit Tests",
        status: "pending",
        type: "test",
        duration: 0,
        logs: [],
        requirements: ["Jest/Mocha", "Test coverage 80%+"]
      },
      {
        id: "integration-tests",
        name: "Integration Tests",
        status: "pending",
        type: "test",
        duration: 0,
        logs: [],
        requirements: ["Test database", "API endpoints"]
      },
      {
        id: "docker-build",
        name: "Build Docker Image",
        status: "pending",
        type: "build",
        duration: 0,
        logs: [],
        requirements: ["Dockerfile", "Docker registry"]
      },
      {
        id: "deploy-k8s",
        name: "Deploy to Kubernetes",
        status: "pending",
        type: "deploy",
        duration: 0,
        logs: [],
        requirements: ["K8s cluster", "Helm charts"]
      }
    ]
  },
  {
    id: "microservice-mesh",
    name: "Microservice Mesh",
    description: "Deploy multiple services with service mesh",
    difficulty: "hard",
    environment: "production",
    isCompleted: false,
    lastRun: null,
    successRate: 0,
    position: { x: 75, y: 20 },
    stages: [
      {
        id: "build-services",
        name: "Build All Services",
        status: "pending",
        type: "build",
        duration: 0,
        logs: [],
        requirements: ["Multi-stage Dockerfile", "Service registry"]
      },
      {
        id: "security-compliance",
        name: "Security Compliance",
        status: "pending",
        type: "security",
        duration: 0,
        logs: [],
        requirements: ["SAST scan", "Container scanning", "Policy enforcement"]
      },
      {
        id: "e2e-tests",
        name: "End-to-End Tests",
        status: "pending",
        type: "test",
        duration: 0,
        logs: [],
        requirements: ["Cypress/Playwright", "Test environment"]
      },
      {
        id: "canary-deploy",
        name: "Canary Deployment",
        status: "pending",
        type: "deploy",
        duration: 0,
        logs: [],
        requirements: ["Istio/Linkerd", "Monitoring setup"]
      }
    ]
  }
];

const INFRASTRUCTURE_TOWERS: InfrastructureTower[] = [
  {
    id: "compute-cluster",
    name: "Compute Cluster",
    type: "compute",
    level: 1,
    isActive: false,
    capacity: 100,
    usage: 0,
    position: { x: 15, y: 60 }
  },
  {
    id: "storage-vault",
    name: "Storage Vault",
    type: "storage",
    level: 1,
    isActive: false,
    capacity: 1000,
    usage: 0,
    position: { x: 35, y: 70 }
  },
  {
    id: "network-hub",
    name: "Network Hub",
    type: "network",
    level: 1,
    isActive: false,
    capacity: 500,
    usage: 0,
    position: { x: 55, y: 65 }
  },
  {
    id: "monitoring-tower",
    name: "Monitoring Tower",
    type: "monitoring",
    level: 1,
    isActive: false,
    capacity: 200,
    usage: 0,
    position: { x: 75, y: 75 }
  }
];

const PIPELINE_TASKS = {
  deployment: [
    {
      id: "fix-dockerfile",
      title: "Fix Dockerfile Issue",
      description: "The Docker build is failing due to missing dependencies",
      brokenCode: `FROM node:16\nCOPY package.json .\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]`,
      fixedCode: `FROM node:16\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nUSER node\nCMD ["npm", "start"]`,
      explanation: "Added WORKDIR, copied package-lock.json, used npm ci, and added security with USER directive"
    },
    {
      id: "fix-k8s-config",
      title: "Fix Kubernetes Config",
      description: "The deployment is failing due to incorrect resource limits",
      brokenCode: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 10\n  selector:\n    matchLabels:\n      app: myapp`,
      fixedCode: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: myapp\n  template:\n    spec:\n      containers:\n      - name: app\n        resources:\n          requests:\n            cpu: 100m\n            memory: 128Mi\n          limits:\n            cpu: 500m\n            memory: 512Mi`,
      explanation: "Reduced replicas, added resource requests and limits for better resource management"
    }
  ]
};

export default function DeployDomeContent() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(PIPELINES);
  const [towers, setTowers] = useState<InfrastructureTower[]>(INFRASTRUCTURE_TOWERS);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [userCode, setUserCode] = useState("");
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);

  const openPipelineDialog = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setIsPipelineDialogOpen(true);
    setCurrentStageIndex(0);
    setIsRunning(false);
  };

  const runPipeline = async () => {
    if (!selectedPipeline) return;
    
    setIsRunning(true);
    const updatedStages = [...selectedPipeline.stages];
    
    for (let i = 0; i < updatedStages.length; i++) {
      setCurrentStageIndex(i);
      
      // Update stage to running
      updatedStages[i] = { ...updatedStages[i], status: "running" };
      setSelectedPipeline({ ...selectedPipeline, stages: updatedStages });
      
      // Simulate stage execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.2; // 80% success rate
      
      updatedStages[i] = { 
        ...updatedStages[i], 
        status: success ? "success" : "failed",
        duration: Math.floor(Math.random() * 120) + 30,
        logs: success 
          ? [`✅ ${updatedStages[i].name} completed successfully`, `Duration: ${updatedStages[i].duration}s`]
          : [`❌ ${updatedStages[i].name} failed`, `Error: Build step failed`, `Duration: ${updatedStages[i].duration}s`]
      };
      
      setSelectedPipeline({ ...selectedPipeline, stages: updatedStages });
      
      if (!success) {
        // Pipeline failed, stop execution
        break;
      }
    }
    
    const allSuccess = updatedStages.every(stage => stage.status === "success");
    if (allSuccess) {
      // Trigger rocket animation and tower upgrade
      setShowRocketAnimation(true);
      upgradeTowers();
      completePipeline(selectedPipeline.id);
      
      setTimeout(() => setShowRocketAnimation(false), 3000);
    }
    
    setIsRunning(false);
  };

  const upgradeTowers = () => {
    setTowers(prev => prev.map(tower => ({
      ...tower,
      level: Math.min(tower.level + 1, 5),
      isActive: true,
      usage: Math.min(tower.usage + 20, tower.capacity)
    })));
  };

  const completePipeline = (pipelineId: string) => {
    setPipelines(prev => prev.map(pipeline =>
      pipeline.id === pipelineId 
        ? { 
            ...pipeline, 
            isCompleted: true, 
            lastRun: new Date(),
            successRate: Math.min(pipeline.successRate + 10, 100)
          }
        : pipeline
    ));
  };

  const getTowerGlow = (tower: InfrastructureTower) => {
    if (!tower.isActive) return "";
    
    const glowColors = {
      compute: "shadow-blue-400/50 shadow-lg",
      storage: "shadow-green-400/50 shadow-lg", 
      network: "shadow-purple-400/50 shadow-lg",
      monitoring: "shadow-yellow-400/50 shadow-lg"
    };
    
    return glowColors[tower.type];
  };

  const getTowerHeight = (tower: InfrastructureTower) => {
    return 40 + tower.level * 8; // Base height + level scaling
  };

  const handleTaskCodeSubmit = async () => {
    if (selectedTask && userCode.trim()) {
      setIsAnalyzing(true);
      setAnalysisResult("");
      
      try {
        // Real-time code analysis
        const result = await analyzeDeploymentCode(userCode, selectedTask);
        setAnalysisResult(result.output);
        
        setTimeout(() => {
          if (result.isCorrect) {
            alert("Great! You've fixed the issue correctly. The deployment should work now.");
            setSelectedTask(null);
            setUserCode("");
          } else {
            alert("Not quite right. Check the explanation and try again.");
          }
          setIsAnalyzing(false);
        }, 1500);
        
      } catch (error) {
        setAnalysisResult(`Analysis failed: ${error.message}`);
        setIsAnalyzing(false);
      }
    }
  };
  
  const analyzeDeploymentCode = async (code: string, task: {id: string, fixedCode: string, explanation: string}): Promise<{output: string, isCorrect: boolean}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let output = "";
        let isCorrect = false;
        
        if (task.id === 'fix-dockerfile') {
          const hasWorkdir = code.includes('WORKDIR');
          const hasPackageLock = code.includes('package-lock.json');
          const hasNpmCi = code.includes('npm ci');
          const hasUserDirective = code.includes('USER');
          
          output = `🔍 Dockerfile Analysis:\n`;
          output += `• WORKDIR directive: ${hasWorkdir ? '✅' : '❌'}\n`;
          output += `• Package lock file: ${hasPackageLock ? '✅' : '❌'}\n`;
          output += `• npm ci usage: ${hasNpmCi ? '✅' : '❌'}\n`;
          output += `• Security (USER): ${hasUserDirective ? '✅' : '❌'}\n`;
          
          isCorrect = hasWorkdir && hasPackageLock && hasNpmCi && hasUserDirective;
          output += `\n${isCorrect ? '✅ All best practices followed!' : '⚠️ Some improvements needed'}`;
        } else {
          const hasResourceLimits = code.includes('limits:') && code.includes('requests:');
          const hasReasonableReplicas = !code.includes('replicas: 10');
          
          output = `🔍 Kubernetes Config Analysis:\n`;
          output += `• Resource limits: ${hasResourceLimits ? '✅' : '❌'}\n`;
          output += `• Reasonable replicas: ${hasReasonableReplicas ? '✅' : '❌'}\n`;
          
          isCorrect = hasResourceLimits && hasReasonableReplicas;
          output += `\n${isCorrect ? '✅ Configuration optimized!' : '⚠️ Configuration needs adjustment'}`;
        }
        
        resolve({ output, isCorrect });
      }, 800 + Math.random() * 800);
    });
  };
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  return (
    <div className="space-y-6">
      {/* Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {towers.map((tower) => (
          <div 
            key={tower.id}
            className={`bg-gray-800/50 rounded-lg p-4 border transition-all ${
              tower.isActive ? 'border-blue-500/50' : 'border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {tower.type === 'compute' && <Server className="w-4 h-4 text-blue-400" />}
              {tower.type === 'storage' && <Database className="w-4 h-4 text-green-400" />}
              {tower.type === 'network' && <Cloud className="w-4 h-4 text-purple-400" />}
              {tower.type === 'monitoring' && <Shield className="w-4 h-4 text-yellow-400" />}
              <h3 className="font-semibold text-white">{tower.name}</h3>
            </div>
            <div className="text-sm text-gray-300 mb-2">Level {tower.level}</div>
            <Progress value={(tower.usage / tower.capacity) * 100} className="h-2" />
            <div className="text-xs text-gray-400 mt-1">
              {tower.usage}/{tower.capacity} capacity
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Grid */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-black rounded-xl p-8 min-h-[500px] relative overflow-hidden border border-blue-500/20">
        {showRocketAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-6xl animate-ping">🚀</div>
          </div>
        )}
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-5 left-10 w-8 h-12 bg-blue-400 rounded-sm animate-pulse"></div>
          <div className="absolute top-10 right-20 w-6 h-8 bg-green-400 rounded-sm animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-10 h-6 bg-purple-400 rounded-sm animate-pulse delay-2000"></div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-blue-400" />
          Deployment Pipelines
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {pipelines.map((pipeline) => (
            <button
              key={pipeline.id}
              onClick={() => openPipelineDialog(pipeline)}
              className="group text-left"
            >
              <div className={`
                relative p-6 rounded-lg border-2 transition-all duration-300 bg-gray-800/90 min-h-[160px] flex flex-col justify-between
                ${pipeline.isCompleted 
                  ? 'border-green-500 shadow-green-500/30 shadow-lg' 
                  : 'border-gray-600 hover:border-blue-400 hover:scale-[1.02]'
                }
              `}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-white">{pipeline.name}</span>
                    {pipeline.isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">{pipeline.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={pipeline.difficulty === "easy" ? "secondary" : 
                               pipeline.difficulty === "medium" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {pipeline.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pipeline.environment}
                    </Badge>
                  </div>
                  
                  {pipeline.isCompleted && (
                    <div className="text-xs text-green-400">
                      ✅ Completed • Success Rate: {pipeline.successRate}%
                    </div>
                  )}
                  
                  {!pipeline.isCompleted && (
                    <div className="text-xs text-gray-400">
                      {pipeline.stages.length} stages • Click to deploy
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Infrastructure Towers */}
        <div className="absolute bottom-8 left-8 right-8">
          <h4 className="text-lg font-semibold text-white mb-4">Infrastructure Towers</h4>
          <div className="flex justify-between">
            {towers.map((tower) => (
              <div 
                key={tower.id}
                className={`relative transition-all duration-500 ${getTowerGlow(tower)}`}
                style={{ 
                  width: '40px',
                  height: `${getTowerHeight(tower)}px`,
                }}
              >
                <div className={`
                  w-full h-full rounded-t-lg border-2 transition-all
                  ${tower.isActive 
                    ? 'bg-gradient-to-t from-gray-700 to-blue-500 border-blue-400' 
                    : 'bg-gray-700 border-gray-500'
                  }
                `}>
                  <div className="absolute top-1 left-1 right-1">
                    {Array.from({ length: tower.level }).map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 mb-1 rounded ${
                          tower.isActive ? 'bg-blue-300' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white">
                  {tower.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Dialog */}
      <Dialog open={isPipelineDialogOpen} onOpenChange={setIsPipelineDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-blue-400" />
              {selectedPipeline?.name}
              <Badge variant={selectedPipeline?.difficulty === "easy" ? "secondary" : 
                             selectedPipeline?.difficulty === "medium" ? "default" : "destructive"}>
                {selectedPipeline?.difficulty}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedPipeline && (
            <div className="space-y-6">
              {/* Pipeline Control */}
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                <div>
                  <h4 className="font-semibold text-white">{selectedPipeline.description}</h4>
                  <p className="text-sm text-gray-300">Environment: {selectedPipeline.environment}</p>
                </div>
                <Button 
                  onClick={runPipeline}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Pipeline
                    </>
                  )}
                </Button>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Pipeline Stages</h4>
                {selectedPipeline.stages.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className={`border rounded-lg p-4 transition-all ${
                      stage.status === 'success' ? 'border-green-500 bg-green-500/10' :
                      stage.status === 'failed' ? 'border-red-500 bg-red-500/10' :
                      stage.status === 'running' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {stage.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {stage.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                        {stage.status === 'running' && <Zap className="w-5 h-5 text-yellow-400 animate-spin" />}
                        {stage.status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                        <h5 className="font-semibold text-white">{stage.name}</h5>
                        <Badge 
                          variant={stage.type === 'build' ? 'default' : 
                                   stage.type === 'test' ? 'secondary' :
                                   stage.type === 'security' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {stage.type}
                        </Badge>
                      </div>
                      {stage.duration > 0 && (
                        <div className="text-sm text-gray-400">{stage.duration}s</div>
                      )}
                    </div>
                    
                    {/* Requirements */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-400 mb-1">Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {stage.requirements.map((req, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Logs */}
                    {stage.logs.length > 0 && (
                      <div className="bg-black/50 rounded p-3 font-mono text-sm">
                        {stage.logs.map((log, i) => (
                          <div key={i} className="text-gray-300">{log}</div>
                        ))}
                      </div>
                    )}

                    {/* Task Buttons for failed stages */}
                    {stage.status === 'failed' && (
                      <div className="mt-3 flex gap-2">
                        {PIPELINE_TASKS.deployment.map((task) => (
                          <Button 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            variant="outline"
                            size="sm"
                            className="text-yellow-400 border-yellow-400"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Fix Issue
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Task Dialog */}
              {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-gray-900 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto border border-gray-700">
                    <h4 className="text-xl font-bold text-white mb-4">{selectedTask.title}</h4>
                    <p className="text-gray-300 mb-4">{selectedTask.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-semibold text-white mb-2">Broken Code:</h5>
                        <pre className="bg-red-900/20 border border-red-600/30 rounded p-3 text-sm text-red-100 overflow-x-auto">
                          {selectedTask.brokenCode}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-2">Expected Fix:</h5>
                        <pre className="bg-green-900/20 border border-green-600/30 rounded p-3 text-sm text-green-100 overflow-x-auto">
                          {selectedTask.fixedCode}
                        </pre>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-semibold text-white mb-2">Your Solution:</h5>
                      <Textarea
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="Write your fix here..."
                        className="min-h-[150px] font-mono bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    
                    {/* Real-time analysis output */}
                    {analysisResult && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-white mb-2">Analysis Result:</h5>
                        <div className="bg-black/50 border border-gray-600 rounded p-3">
                          <pre className="text-sm text-cyan-400 whitespace-pre-wrap">{analysisResult}</pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Loading indicator */}
                    {isAnalyzing && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-blue-400">
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Analyzing deployment configuration...</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3 mb-4">
                      <h6 className="font-semibold text-blue-300 mb-1">Explanation:</h6>
                      <p className="text-blue-100 text-sm">{selectedTask.explanation}</p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        onClick={() => setSelectedTask(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleTaskCodeSubmit}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!userCode.trim() || isAnalyzing}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Submit Fix'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}