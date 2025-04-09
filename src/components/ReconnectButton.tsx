import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import useWebSocket from "@/hooks/useWebSocket";

export const ReconnectButton = () => {
  const { isConnected, socket } = useWebSocket();

  const handleReconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  if (isConnected) return null;

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleReconnect}
      className="fixed bottom-16 right-4 bg-background/95 backdrop-blur-sm animate-pulse"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Reconnecter
    </Button>
  );
};