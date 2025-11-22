import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import personalPlanet from "@/assets/personal-planet.jpg";
import { Sparkles, Code2 } from "lucide-react";

export default function PersonalPlanetEvolution() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <Navigation onLoginClick={() => setIsLoginOpen(true)} />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Coding Planet
          </h1>
          <p className="text-purple-200 text-lg">
            Level up through coding challenges with real-time feedback
          </p>
          
          <div className="relative inline-block">
            <img
              src={personalPlanet}
              alt="Personal Planet"
              className="w-80 h-80 rounded-full shadow-2xl mx-auto object-cover border-4 border-purple-400 animate-pulse"
            />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Code2 className="w-6 h-6 text-purple-400" />
              Coding Challenges
            </h2>
            
            <p className="text-gray-300 mb-6">
              Your planet is ready to evolve through coding challenges!
            </p>
            
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => alert("Coding challenges are loading! This is a test to verify the page is working.")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Coding Challenge
            </Button>
          </div>
        </div>
      </div>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}