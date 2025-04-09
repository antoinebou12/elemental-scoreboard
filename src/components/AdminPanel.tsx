import { Element } from '@/types/elements';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ElementsChart from './ElementsChart';
import useWebSocket from '@/hooks/useWebSocket';
import { useToast } from '@/components/ui/use-toast';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  elements: Element[];
  onUpdatePoints: (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET' | 'INCREMENT_BY' | 'DECREMENT_BY', value?: number) => void;
  onResetScores: () => void;
}

const AdminPanel = ({ elements, onUpdatePoints, onResetScores }: AdminPanelProps) => {
  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  const handlePointChange = (id: string, action: 'INCREMENT' | 'DECREMENT' | 'SET' | 'INCREMENT_BY' | 'DECREMENT_BY', value?: number) => {
    if (!isConnected) {
      toast({
        title: "Connexion hors ligne",
        description: "Les modifications ne seront pas synchronisées immédiatement",
        variant: "destructive"
      });
    }
    onUpdatePoints(id, action, value);
  };

  return (
    <div className="space-y-8 container mx-auto px-4">
      <ElementsChart elements={elements} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elements.map((element) => (
          <Card key={element.id} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{element.name}</h3>
              <span className="text-2xl font-bold">{element.points}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePointChange(element.id, 'DECREMENT')}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min="0"
                value={element.points}
                onChange={(e) => handlePointChange(element.id, 'SET', parseInt(e.target.value) || 0)}
                className="text-center"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePointChange(element.id, 'INCREMENT')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Points à ajouter/retirer"
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handlePointChange(element.id, 'INCREMENT_BY', value);
                }}
              />
              <Button
                variant="secondary"
                onClick={() => handlePointChange(element.id, 'SET', 0)}
              >
                Réinitialiser
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          variant="destructive"
          onClick={onResetScores}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Réinitialiser tous les scores
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;
