import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import personalPlanet from "@/assets/personal-planet.jpg";
import { ArrowRight } from "lucide-react";

export const PlanetPreview = () => {
  return (
    <div className="relative">
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-pulse" />
        <img 
          src={personalPlanet} 
          alt="Your Personal Planet"
          className="relative w-full h-full object-cover rounded-full animate-[spin_60s_linear_infinite]"
        />
      </div>
      
      <div className="text-center mt-6 space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Planet Ignis</h3>
        <p className="text-sm text-muted-foreground italic">The land sleeps… feed it with logic.</p>
        <Link to="/evolution">
          <Button 
            variant="default" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold"
          >
            Explore <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
