import { Button } from "@/components/ui/button";
import { LogIn, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onLoginClick: () => void;
  isLoggedIn?: boolean;
}

export const Navigation = ({ onLoginClick }: NavigationProps) => {
  const { user, isAuthenticated, logout, loading } = useAuth();

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
          <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">Galaxy</a>
        </div>
        
        {loading ? (
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
        ) : isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border hover:bg-secondary/50 h-10">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                {user.username}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  )}
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    Signed in via {user.provider}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="default"
            onClick={onLoginClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Enter Orbit
          </Button>
        )}
      </div>
    </nav>
  );
};
