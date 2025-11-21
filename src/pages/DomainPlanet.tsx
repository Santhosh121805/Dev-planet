import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play } from "lucide-react";
import algoImage from "@/assets/planet-algo.jpg";
import deployImage from "@/assets/planet-deploy.jpg";
import web3Image from "@/assets/planet-web3.jpg";
import aiImage from "@/assets/planet-ai.jpg";
import uiImage from "@/assets/planet-ui.jpg";

const planetData = {
  "algonebula": {
    title: "AlgoNebula",
    domain: "Algorithms & Data Structures",
    description: "Star nodes, comet trails, glowing neural galaxy",
    image: algoImage,
  },
  "deploydome": {
    title: "DeployDome",
    domain: "DevOps & Infrastructure",
    description: "Pipelines, rockets, glass and neon infrastructure",
    image: deployImage,
  },
  "blocktropolis": {
    title: "BlockTropolis",
    domain: "Web3 & Blockchain",
    description: "Ledger city with holographic blocks",
    image: web3Image,
  },
  "neuraverse": {
    title: "NeuraVerse",
    domain: "AI & Machine Learning",
    description: "Brain orb with pulsing synapse ribbons",
    image: aiImage,
  },
  "pixelora": {
    title: "Pixelora",
    domain: "UI/UX Design",
    description: "Color oceans with floating canvases",
    image: uiImage,
  },
};

export default function DomainPlanet() {
  const { planetId } = useParams<{ planetId: string }>();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [code, setCode] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const planet = planetData[planetId as keyof typeof planetData];

  if (!planet) {
    return <div>Planet not found</div>;
  }

  const handleSubmit = () => {
    if (code.trim()) {
      setHasSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={planet.image} 
          alt={planet.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-16">
          <Button 
            variant="ghost" 
            className="absolute top-8 left-6 text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="space-y-4">
            <div className="text-section text-muted-foreground">{planet.domain}</div>
            <h1 className="text-hero text-foreground">{planet.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{planet.description}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="text-section text-muted-foreground mb-4">Choose Your Path</div>
          <h2 className="text-4xl font-bold text-foreground">Practice, Games & Skill Quests</h2>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="rounded-2xl bg-card border border-border p-6 glow-subtle hover-scale transition-cosmic">
            <div className="text-section text-muted-foreground mb-2">01</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Practice Mode</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Simple coding tasks with subtle cosmic glow
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 glow-subtle hover-scale transition-cosmic">
            <div className="text-section text-muted-foreground mb-2">02</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Challenge Games</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Time-based puzzles as neon stars or planet fragments
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 glow-subtle hover-scale transition-cosmic">
            <div className="text-section text-muted-foreground mb-2">03</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Skill Quests</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Structured quests reflecting planet terrain growth
            </p>
          </div>
        </div>

        {/* Workspace */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-card border border-border p-8 glow-subtle">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Analyzer Active</span>
              </div>
            </div>

            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="quests">Quests</TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="space-y-6">
                <div className="space-y-4">
                  <Textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Write code to awaken this world..."
                    className="min-h-[300px] font-mono bg-background/50"
                  />
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold"
                    disabled={!code.trim()}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Submit & Run
                  </Button>
                </div>

                {!hasSubmitted && (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-muted-foreground italic">
                      Write code to awaken this world.
                    </p>
                  </div>
                )}

                {hasSubmitted && (
                  <div className="rounded-lg bg-background/50 border border-border p-6">
                    <p className="text-sm text-muted-foreground italic">
                      The Analyzer is listening...
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="games" className="space-y-6">
                <div className="text-center py-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Challenge Games</h3>
                  <p className="text-muted-foreground italic max-w-md mx-auto">
                    Write code to awaken this world.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="quests" className="space-y-6">
                <div className="text-center py-12 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Skill Quests</h3>
                  <p className="text-muted-foreground italic max-w-md mx-auto">
                    Write code to awaken this world.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
