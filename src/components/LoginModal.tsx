import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Rocket, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { DemoLoginModal } from "./DemoLoginModal";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const { login, loading } = useAuth();
  const [authLoading, setAuthLoading] = useState<'google' | 'github' | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [oAuthError, setOAuthError] = useState<string | null>(null);

  const hasGoogleConfig = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGitHubConfig = !!import.meta.env.VITE_GITHUB_CLIENT_ID;

  const handleGoogleLogin = async () => {
    if (!hasGoogleConfig) {
      setOAuthError("Google OAuth not configured. Check OAUTH_SETUP.md");
      return;
    }
    
    try {
      setAuthLoading('google');
      setOAuthError(null);
      await login('google');
      onOpenChange(false);
    } catch (error) {
      console.error('Google login failed:', error);
      setOAuthError("Google login failed. Please try again or use demo mode.");
      setAuthLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    if (!hasGitHubConfig) {
      setOAuthError("GitHub OAuth not configured. Check OAUTH_SETUP.md");
      return;
    }
    
    try {
      setAuthLoading('github');
      setOAuthError(null);
      await login('github');
      onOpenChange(false);
    } catch (error) {
      console.error('GitHub login failed:', error);
      setOAuthError("GitHub login failed. Please try again or use demo mode.");
      setAuthLoading(null);
    }
  };

  const handleDemoClick = () => {
    onOpenChange(false);
    setShowDemo(true);
  };

  if (showDemo) {
    return <DemoLoginModal open={showDemo} onOpenChange={setShowDemo} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border glow-subtle">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-3xl font-bold text-center text-foreground">
            Forge Your Coding Planet
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your coding style shapes your world. Begin your journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button 
            variant="default" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-12 font-semibold"
            onClick={handleGoogleLogin}
            disabled={loading || authLoading === 'google' || !hasGoogleConfig}
          >
            {authLoading === 'google' ? (
              <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {authLoading === 'google' ? 'Connecting...' : hasGoogleConfig ? 'Continue with Google' : 'Google (Not Configured)'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-border hover:bg-secondary/50 rounded-lg h-12 font-semibold"
            onClick={handleGithubLogin}
            disabled={loading || authLoading === 'github' || !hasGitHubConfig}
          >
            {authLoading === 'github' ? (
              <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            ) : (
              <Github className="w-5 h-5 mr-3" />
            )}
            {authLoading === 'github' ? 'Connecting...' : hasGitHubConfig ? 'Continue with GitHub' : 'GitHub (Not Configured)'}
          </Button>

          {/* Demo Mode Button */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="w-full rounded-lg h-12 font-semibold"
            onClick={handleDemoClick}
          >
            <Rocket className="w-5 h-5 mr-3" />
            Try Demo Mode
          </Button>
        </div>

        {/* Error Message */}
        {oAuthError && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{oAuthError}</p>
          </div>
        )}

        {/* Configuration Status */}
        {(!hasGoogleConfig || !hasGitHubConfig) && (
          <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
            <p className="text-sm text-orange-600 dark:text-orange-400">
              OAuth not configured. See <code className="font-mono bg-background/50 px-1 rounded">OAUTH_SETUP.md</code> for setup instructions.
            </p>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
};
