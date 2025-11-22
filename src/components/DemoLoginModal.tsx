import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DemoLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoLoginModal = ({ open, onOpenChange }: DemoLoginModalProps) => {
  const { loading } = useAuth();
  const [demoName, setDemoName] = useState('');

  const handleDemoLogin = async () => {
    const mockUser = {
      id: `demo_${Date.now()}`,
      username: demoName || 'Demo User',
      email: 'demo@planetforge.dev',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoName || 'demo'}`,
      provider: 'demo' as const,
    };

    const mockToken = 'demo-token-' + Date.now();

    // Store in localStorage
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    // Trigger page reload to update auth state
    window.location.reload();
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border glow-subtle">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-3xl font-bold text-center text-foreground">
            Demo Mode
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Try Planet Code Forge without OAuth setup. Perfect for development and testing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="demoName">Your Name (Optional)</Label>
            <Input 
              id="demoName"
              placeholder="Enter your name..." 
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              className="bg-background/50"
            />
          </div>
          
          <Button 
            variant="default" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-12 font-semibold"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            🚀 Start Demo Journey
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-4 space-y-2">
          <p>Demo mode uses local storage for authentication simulation.</p>
          <p>For real OAuth, check the OAUTH_SETUP.md guide.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};