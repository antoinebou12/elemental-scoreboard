import { useState, useEffect } from 'react';
import { Element } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import AdminPanel from '@/components/AdminPanel';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WSConnectionStatus from '@/components/WSConnectionStatus';
import { ReconnectButton } from '@/components/ReconnectButton';
import useWebSocket from '@/hooks/useWebSocket';

const initialElements: Element[] = [
  { id: 'fire', name: 'Feu', color: 'fire', points: 0, icon: 'fire' },
  { id: 'earth', name: 'Terre', color: 'earth', points: 0, icon: 'earth' },
  { id: 'air', name: 'Air', color: 'air', points: 0, icon: 'airVent' },
  { id: 'water', name: 'Eau', color: 'water', points: 0, icon: 'droplet' },
  { id: 'lightning', name: 'Foudre', color: 'lightning', points: 0, icon: 'cloudLightning' },
];

const STORAGE_KEY = 'elemental-scores';

const Index = () => {
  const [elements, setElements] = useState<Element[]>(() => {
    const savedElements = localStorage.getItem(STORAGE_KEY);
    return savedElements ? JSON.parse(savedElements) : initialElements;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const { toast } = useToast();
  const correctPasscode = '1234'; // You can change this to any passcode you want
  const { isConnected, emit } = useWebSocket();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements]);

  const handleUpdatePoints = (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET' | 'INCREMENT_BY' | 'DECREMENT_BY', value?: number) => {
    setElements(prevElements => {
      const newElements = prevElements.map(element => {
        if (element.id === id) {
          let newPoints = element.points;
          
          switch (action) {
            case 'INCREMENT':
              newPoints = element.points + 1;
              toast({
                title: `+1 point pour l'équipe ${element.name}`,
                description: `Nouveau score: ${newPoints} points`,
              });
              break;
            case 'DECREMENT':
              newPoints = Math.max(0, element.points - 1);
              toast({
                title: `-1 point pour l'équipe ${element.name}`,
                description: `Nouveau score: ${newPoints} points`,
              });
              break;
            case 'INCREMENT_BY':
              newPoints = element.points + (value || 0);
              toast({
                title: `+${value} points pour l'équipe ${element.name}`,
                description: `Nouveau score: ${newPoints} points`,
              });
              break;
            case 'DECREMENT_BY':
              newPoints = Math.max(0, element.points - (value || 0));
              toast({
                title: `-${value} points pour l'équipe ${element.name}`,
                description: `Nouveau score: ${newPoints} points`,
              });
              break;
            case 'SET':
              if (value !== undefined) {
                newPoints = value;
                toast({
                  title: `Score de l'équipe ${element.name} modifié`,
                  description: `Nouveau score: ${newPoints} points`,
                });
              }
              break;
          }
          
          return { ...element, points: newPoints };
        }
        return element;
      });

      // Emit score update through WebSocket
      if (isConnected) {
        emit('score-update', newElements);
      } else {
        toast({
          title: "Hors ligne",
          description: "Les modifications ne seront pas synchronisées",
          variant: "destructive"
        });
      }
      
      return newElements;
    });
  };

  const resetScores = () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les scores ?");
    if (confirmed) {
      setElements(prevElements =>
        prevElements.map(element => ({ ...element, points: 0 }))
      );
      toast({
        title: "Scores réinitialisés",
        description: "Tous les scores ont été remis à zéro.",
      });
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setIsAuthenticated(true);
      toast({
        title: "Authentification réussie",
        description: "Vous avez maintenant accès au panneau d'administration.",
      });
    } else {
      toast({
        title: "Code incorrect",
        description: "Veuillez réessayer avec le bon code.",
        variant: "destructive"
      });
      setPasscode('');
    }
  };

  const totalScore = elements.reduce((sum, element) => sum + element.points, 0);

  const getWinningTeam = () => {
    return elements.reduce((prev, current) => 
      (prev.points > current.points) ? prev : current
    );
  };

  const getBackgroundStyle = () => {
    const winner = getWinningTeam();
    const gradients = {
      fire: 'bg-gradient-to-br from-orange-950 to-red-950',
      air: 'bg-gradient-to-br from-sky-950 to-blue-950',
      water: 'bg-gradient-to-br from-blue-950 to-indigo-950',
      lightning: 'bg-gradient-to-br from-purple-950 to-violet-950',
      earth: 'bg-gradient-to-br from-amber-950 to-yellow-950'
    };
    return gradients[winner.id as keyof typeof gradients] || 'bg-black';
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundStyle()}`}>
      <Tabs defaultValue="scores" className="container mx-auto px-4 py-2">
        <TabsList className="fixed top-4 right-4 z-50">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="py-2">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white">Score Total: {totalScore}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 h-[calc(100vh-80px)] px-8">
            {elements.map(element => (
              <ElementCard 
                key={element.id}
                element={element}
                onCardClick={isAuthenticated ? (id) => handleUpdatePoints(id, 'INCREMENT') : undefined}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="admin" className="pt-12 pb-8">
          {!isAuthenticated ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Authentification requise</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Entrez le code"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                  <Button type="submit" className="w-full">
                    Accéder
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <AdminPanel 
              elements={elements}
              onUpdatePoints={handleUpdatePoints}
              onResetScores={resetScores}
            />
          )}
        </TabsContent>
      </Tabs>
      <WSConnectionStatus className="fixed bottom-4 right-4" />
      <ReconnectButton />
    </div>
  );
};

export default Index;
