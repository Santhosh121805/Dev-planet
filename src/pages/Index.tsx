import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { DomainCard } from "@/components/DomainCard";
import { PlanetPreview } from "@/components/PlanetPreview";
import { MilkyWayGalaxy } from "@/components/MilkyWayGalaxy";
import CreateProfileModal from "@/components/CreateProfileModal";
import { mockDevelopers, type Developer } from "@/lib/mockDevelopers";
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
  const [createOpen, setCreateOpen] = useState(false);

  // Developers state (initialized with mock data)
  const [developers, setDevelopers] = useState<Developer[]>(mockDevelopers);

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
        onLoginClick={() => setLoginOpen(true)}
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
            <h1 className="text-hero text-foreground drop-shadow-2xl">
              DEV/PLANET
            </h1>
            <p className="text-2xl md:text-3xl text-foreground/90 max-w-3xl mx-auto font-light">
              Your Code Becomes a World.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The universe evolves with you.
            </p>
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
        <DomainCard 
          index="01"
          title="AlgoNebula"
          domain="Algorithms & Data Structures"
          description="Star nodes, comet trails, glowing neural galaxy"
          image={planetAlgo}
          href="/planet/algonebula"
        />
        <DomainCard 
          index="02"
          title="DeployDome"
          domain="DevOps & Infrastructure"
          description="Pipelines, rockets, glass and neon infrastructure"
          image={planetDeploy}
          href="/planet/deploydome"
        />
        <DomainCard 
          index="03"
          title="BlockTropolis"
          domain="Web3 & Blockchain"
          description="Ledger city with holographic blocks"
          image={planetWeb3}
          href="/planet/blocktropolis"
        />
        <DomainCard 
          index="04"
          title="NeuraVerse"
          domain="AI & Machine Learning"
          description="Brain orb with pulsing synapse ribbons"
          image={planetAi}
          href="/planet/neuraverse"
        />
        <DomainCard 
          index="05"
          title="Pixelora"
          domain="UI/UX Design"
          description="Color oceans with floating canvases"
          image={planetUi}
          href="/planet/pixelora"
        />
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

      {/* MilkyWay Galaxy Section */}
      <section id="milkyway" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="text-section text-muted-foreground mb-2">Developer Universe</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Explore the MilkyWay</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              Discover and collaborate with developers across the galaxy. Each node represents a developer, 
              grouped by their expertise in different programming languages and frameworks.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg h-12 px-8 font-semibold glow-purple hover-scale"
              onClick={() => setCreateOpen(true)}
            >
              Create Your Developer Profile
            </Button>
          </div>
          
          <MilkyWayGalaxy developers={developers} onOpenCreate={() => setCreateOpen(true)} />
          <CreateProfileModal open={createOpen} onOpenChange={setCreateOpen} onCreate={(dev) => setDevelopers(prev => [...prev, dev])} />
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
