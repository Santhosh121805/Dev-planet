import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DomainCardProps {
  index: string;
  title: string;
  domain: string;
  description: string;
  image: string;
  href: string;
}

export const DomainCard = ({ index, title, domain, description, image, href }: DomainCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border glow-subtle hover-scale transition-cosmic">
      <div className="aspect-square w-full overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-cosmic"
        />
      </div>
      
      <div className="p-6 space-y-3">
        <div className="text-section text-muted-foreground">{index}</div>
        
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        
        <p className="text-sm text-muted-foreground">{domain}</p>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        <Link to={href}>
          <Button 
            variant="default" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold group-hover:glow-primary transition-cosmic"
          >
            Explore <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
