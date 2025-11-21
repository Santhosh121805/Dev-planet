import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import personalPlanet from "@/assets/personal-planet.jpg";
import { Sparkles } from "lucide-react";

export default function PersonalPlanetEvolution() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [code, setCode] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (code.trim()) {
      setHasSubmitted(true);
      setIsEditorOpen(false);
      setCode("");
    }
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
