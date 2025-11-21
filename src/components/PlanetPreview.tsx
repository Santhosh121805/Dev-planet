import personalPlanet from "@/assets/personal-planet.jpg";

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
      
      <div className="text-center mt-6 space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Planet Ignis</h3>
        <p className="text-sm text-muted-foreground">Level 7 • Evolving</p>
      </div>
    </div>
  );
};
