import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { DomainCard } from "@/components/DomainCard";
import { AnalyzerPanel } from "@/components/AnalyzerPanel";
import { PlanetPreview } from "@/components/PlanetPreview";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import heroLandscape from "@/assets/hero-landscape.jpg";
import planetAlgo from "@/assets/planet-algo.jpg";
import planetDeploy from "@/assets/planet-deploy.jpg";
import planetWeb3 from "@/assets/planet-web3.jpg";
import planetAi from "@/assets/planet-ai.jpg";
import planetUi from "@/assets/planet-ui.jpg";

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const domains = [
    {
      index: "01",
      title: "AlgoNebula",
      domain: "Algorithms & Data Structures",
      description: "Navigate through star nodes and comet trails. Master the mathematics of computation.",
      image: planetAlgo,
      href: "/algonebula"
    },
    {
      index: "02",
      title: "DeployDome",
      domain: "DevOps & Infrastructure",
      description: "Build pipelines and launch rockets. Orchestrate the symphony of deployment.",
      image: planetDeploy,
      href: "/deploydome"
    },
    {
      index: "03",
      title: "BlockTropolis",
      domain: "Web3 & Blockchain",
      description: "Explore the ledger city. Craft decentralized futures on the blockchain.",
      image: planetWeb3,
      href: "/blocktropolis"
    },
    {
      index: "04",
      title: "NeuraVerse",
      domain: "AI & Machine Learning",
      description: "Pulse through synapse ribbons. Teach machines to dream and learn.",
      image: planetAi,
      href: "/neuraverse"
    },
    {
      index: "05",
      title: "Pixelora",
      domain: "UI/UX Design",
      description: "Paint across color oceans. Design experiences that move souls.",
      image: planetUi,
      href: "/pixelora"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onLoginClick={() => {
          if (isLoggedIn) {
            // Go to profile
          } else {
            setLoginOpen(true);
          }
        }}
        isLoggedIn={isLoggedIn}
      />
      
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroLandscape})`,
            filter: "brightness(0.4)"
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        
        <div className="relative z-10 container mx-auto px-6 text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block text-section text-muted-foreground mb-4">
              The Analyzer Studies Your Style
            </div>
            <h1 className="text-hero text-foreground drop-shadow-2xl">
              DEV/PLANET
            </h1>
            <p className="text-2xl md:text-3xl text-foreground/90 max-w-3xl mx-auto font-light">
              Your Code Becomes a World.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="px-4 py-2 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50">
              <span className="text-muted-foreground">Elegance:</span>
              <span className="ml-2 text-primary font-mono">72%</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50">
              <span className="text-muted-foreground">Chaos Storm:</span>
              <span className="ml-2 text-accent font-mono">28%</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50">
              <span className="text-muted-foreground">Naming Gravity:</span>
              <span className="ml-2 text-primary font-mono">85%</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50">
              <span className="text-muted-foreground">Creativity:</span>
              <span className="ml-2 text-accent font-mono">94%</span>
            </div>
          </div>
          
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-14 px-8 text-lg font-bold glow-primary hover-scale"
            onClick={() => setLoginOpen(true)}
          >
            Enter the Orbit
          </Button>
        </div>
      </section>

      {/* Domain Planets Section */}
      <section id="explore" className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="text-section text-muted-foreground mb-2">Explore the Cosmos</div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Choose Your Domain Planet</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {domains.slice(0, 3).map((domain) => (
              <DomainCard key={domain.index} {...domain} />
            ))}
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" className="rounded-full border-border hover:bg-secondary/50">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-border hover:bg-secondary/50">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Personal Planet Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-section text-muted-foreground mb-2">Your Living Identity</div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Personal Planet Evolution
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Every function, every variable name, every refactor shapes your planet's atmosphere. 
                Your coding DNA becomes visible in real-time through evolving terrain, climate, and cosmic phenomena.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Real-time style analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-foreground">Dynamic visual evolution</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Personality-driven landscapes</span>
                </div>
              </div>
            </div>
            
            <div>
              <PlanetPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Analyzer Section */}
      <section id="analyzer" className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <AnalyzerPanel />
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="text-section text-muted-foreground mb-2">Community Showcase</div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Browse Our Galaxy</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {domains.slice(3, 5).map((domain) => (
              <DomainCard key={domain.index} {...domain} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-cosmic" />
            <span className="text-lg font-bold tracking-wider text-foreground">DEV/PLANET</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The universe evolves with you. © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
