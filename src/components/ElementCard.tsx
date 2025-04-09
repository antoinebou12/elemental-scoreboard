import { useState, useRef, useEffect } from 'react';
import { Element } from '@/types/elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Wind, Droplet, CloudLightning, GlobeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/elementCard.css';

interface ElementCardProps {
  element: Element;
  onCardClick?: (id: string) => void;
}

const getElementIcon = (id: string) => {
  switch (id) {
    case 'fire':
      return <Flame className="h-12 w-12 text-orange-200" />;
    case 'air':
      return <Wind className="h-12 w-12 text-sky-200" />;
    case 'water':
      return <Droplet className="h-12 w-12 text-blue-200" />;
    case 'lightning':
      return <CloudLightning className="h-12 w-12 text-purple-200" />;
    case 'earth':
      return <GlobeIcon className="h-12 w-12 text-amber-200" />;
    default:
      return null;
  }
};

const getElementBackground = (id: string) => {
  const backgrounds = {
    fire: {
      image: 'url("https://images.unsplash.com/photo-1549317336-206569e8475c?q=80&w=500")',
      gradient: 'from-orange-600/60 to-red-700/60'
    },
    air: {
      image: 'url("https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=500")',
      gradient: 'from-sky-400/60 to-blue-500/60'
    },
    water: {
      image: 'url("https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=500")',
      gradient: 'from-blue-500/60 to-blue-700/60'
    },
    lightning: {
      image: 'url("https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?q=80&w=500")',
      gradient: 'from-purple-500/60 to-purple-700/60'
    },
    earth: {
      image: 'url("https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?q=80&w=500")',
      gradient: 'from-amber-600/60 to-amber-800/60'
    }
  };
  return backgrounds[id as keyof typeof backgrounds];
};

const ElementCard: React.FC<ElementCardProps> = ({ element, onCardClick }) => {
  const [prevPoints, setPrevPoints] = useState(element.points);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationValue, setAnimationValue] = useState(0);

  useEffect(() => {
    if (element.points !== prevPoints) {
      setIsAnimating(true);
      setAnimationValue(element.points - prevPoints);
      setPrevPoints(element.points);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [element.points, prevPoints]);

  const background = getElementBackground(element.id);
  
  return (
    <Card 
      onClick={() => onCardClick?.(element.id)}
      className={cn(
        "relative overflow-hidden transition-all duration-500 h-full min-h-[300px]",
        "hover:scale-105 hover:shadow-2xl cursor-pointer",
        "hover:ring-4 hover:ring-opacity-50",
        {
          'ring-orange-500': element.id === 'fire',
          'ring-sky-500': element.id === 'air',
          'ring-blue-500': element.id === 'water',
          'ring-purple-500': element.id === 'lightning',
          'ring-amber-500': element.id === 'earth',
        }
      )}
      style={{
        backgroundImage: background.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-300",
        background.gradient,
        isAnimating && "opacity-80"
      )}></div>
      
      <CardHeader className="relative z-10 h-full flex items-center justify-center py-8">
        <CardTitle className="text-center flex flex-col items-center gap-8 text-white">
          <div className={cn(
            "transform transition-all duration-300",
            "hover:scale-110 hover:rotate-3",
            isAnimating && "animate-bounce"
          )}>
            {getElementIcon(element.id)}
          </div>
          <span className="text-3xl font-semibold">{element.name}</span>
          <div className="relative">
            <div className={cn(
              "text-7xl font-bold transition-all duration-300",
              isAnimating && "scale-125"
            )}>
              {element.points}
            </div>
            {isAnimating && (
              <div className={cn(
                "absolute -top-8 left-1/2 transform -translate-x-1/2",
                "text-2xl font-bold transition-all duration-300",
                "animate-fade-up",
                animationValue > 0 ? "text-green-400" : "text-red-400"
              )}>
                {animationValue > 0 ? `+${animationValue}` : animationValue}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default ElementCard;
