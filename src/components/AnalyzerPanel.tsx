import { Sparkles, Code2, RefreshCw, Zap, Palette } from "lucide-react";

interface Trait {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const AnalyzerPanel = () => {
  const hasAnalyzedCode = false; // This would be connected to actual code analysis later

  const traits: Trait[] = [
    { name: "Elegance vs Chaos", value: 0, icon: <Sparkles className="w-4 h-4" />, color: "hsl(270, 50%, 50%)" },
    { name: "Comment Poetry", value: 0, icon: <Code2 className="w-4 h-4" />, color: "hsl(16, 100%, 61%)" },
    { name: "Refactor Halo", value: 0, icon: <RefreshCw className="w-4 h-4" />, color: "hsl(200, 70%, 60%)" },
    { name: "Naming Gravity", value: 0, icon: <Zap className="w-4 h-4" />, color: "hsl(280, 60%, 55%)" },
    { name: "Creativity Storm", value: 0, icon: <Palette className="w-4 h-4" />, color: "hsl(16, 100%, 61%)" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border p-8 glow-subtle">
      <div className="text-center space-y-6">
        <div className="inline-block">
          <div className="text-section text-muted-foreground mb-2">The Analyzer</div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Your Code Signature</h2>
        </div>

        {!hasAnalyzedCode ? (
          <div className="max-w-2xl mx-auto py-12">
            <p className="text-muted-foreground italic text-lg">
              The Analyzer is listening...
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Write code to awaken this world.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {traits.map((trait) => (
              <div key={trait.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div style={{ color: trait.color }}>{trait.icon}</div>
                    <span className="text-foreground font-medium">{trait.name}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">{trait.value}%</span>
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
