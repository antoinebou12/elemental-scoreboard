import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Element } from '@/types/elements';
import ElementCard from '@/components/ElementCard';
import AdminPanel from '@/components/AdminPanel';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements]);

  useEffect(() => {
    // Initialize socket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsPort = ':3001';
    const wsUrl = `${wsProtocol}//${window.location.hostname}${wsPort}`;

    socketRef.current = io(wsUrl, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('score-updated', (updatedElements) => {
      setElements(updatedElements);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
      if (socketRef.current) {
        socketRef.current.emit('score-update', newElements);
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

  return (
    <div className="min-h-screen bg-black">
      <Tabs defaultValue="scores" className="container mx-auto px-4 py-2">
        <TabsList className="fixed top-4 right-4 z-50">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="py-2">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white">Score Total: {totalScore}</h2>
          </div>
          <div className="grid grid-cols-5 gap-8 h-[calc(100vh-80px)] px-8">
            {elements.map(element => (
              <ElementCard 
                key={element.id}
                element={element}
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
    </div>
  );
};

export default Index;
