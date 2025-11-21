import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";

interface NavigationProps {
  onLoginClick: () => void;
  isLoggedIn?: boolean;
}

export const Navigation = ({ onLoginClick, isLoggedIn = false }: NavigationProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-cosmic" />
          <span className="text-xl font-bold tracking-wider text-foreground">DEV/PLANET</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#explore" className="text-muted-foreground hover:text-foreground transition-colors">Explore</a>
          <a href="#analyzer" className="text-muted-foreground hover:text-foreground transition-colors">Analyzer</a>
          <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
        </div>
        
        <Button 
          variant={isLoggedIn ? "outline" : "default"}
          onClick={onLoginClick}
          className={isLoggedIn 
            ? "border-border hover:bg-secondary/50" 
            : "bg-primary text-primary-foreground hover:bg-primary/90"
          }
        >
          {isLoggedIn ? (
            <>
              <User className="w-4 h-4 mr-2" />
              Profile
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Enter Orbit
            </>
          )}
        </Button>
      </div>
    </nav>
  );
};
