import { useState, useRef, useEffect } from 'react';
import { Element } from '@/types/elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Wind, Droplet, CloudLightning, GlobeIcon } from 'lucide-react';

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

const ElementCard: React.FC<ElementCardProps> = ({ element }) => {
  const [prevPoints, setPrevPoints] = useState(element.points);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (element.points !== prevPoints) {
      setIsAnimating(true);
      setPrevPoints(element.points);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [element.points, prevPoints]);

  const background = getElementBackground(element.id);
  
  return (
    <Card 
      className="relative overflow-hidden shadow-lg hover:scale-105 transition-all duration-300 h-full min-h-[300px]"
      style={{
        backgroundImage: background.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${background.gradient} transition-opacity duration-300`}></div>
      <CardHeader className="relative z-10 h-full flex items-center justify-center py-8">
        <CardTitle className="text-center flex flex-col items-center gap-8 text-white">
          <div className="transform scale-[2]">
            {getElementIcon(element.id)}
          </div>
          <span className="text-3xl font-semibold">{element.name}</span>
          <div className={`text-7xl font-bold ${isAnimating ? 'score-change' : ''}`}>
            {element.points}
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default ElementCard;
