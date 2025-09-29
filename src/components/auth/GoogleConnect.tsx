import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { googleAuth } from "@/lib/google-auth";
import { useLogger } from "@/utils/logger";

interface GoogleConnectProps {
  onConnected: (accessToken: string) => void;
  isConnected: boolean;
}

export const GoogleConnect = ({ onConnected, isConnected }: GoogleConnectProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const logger = useLogger();

  const handleConnect = async () => {
    logger.auth("Iniciando processo de conexão com Google", { 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent 
    });
    
    setIsLoading(true);
    
    try {
      // Verificar se as configurações estão corretas
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      logger.debug("AUTH", "Verificando configuração do Client ID", { 
        hasClientId: !!clientId,
        isPlaceholder: clientId === "your-google-client-id.apps.googleusercontent.com"
      });
      
      if (!clientId || clientId === "your-google-client-id.apps.googleusercontent.com") {
        logger.error("AUTH", "Client ID não configurado ou é placeholder", { clientId });
        throw new Error('Google Client ID não configurado. Verifique o arquivo .env');
      }

      logger.info("AUTH", "Configuração validada, iniciando autenticação");
      toast({
        title: "Inicializando...",
        description: "Carregando autenticação Google...",
      });

      await logger.measureTime("AUTH", "Inicialização do Google Auth", async () => {
        await googleAuth.initializeAuth();
      });
      
      logger.auth("Google Auth inicializado com sucesso");
      toast({
        title: "Aguardando autorização...",
        description: "Complete a autorização na janela do Google.",
      });

      const accessToken = await logger.measureTime("AUTH", "Solicitação de acesso", async () => {
        return await googleAuth.requestAccess();
      });
      
      logger.auth("Token de acesso obtido com sucesso", { 
        tokenLength: accessToken?.length || 0,
        hasToken: !!accessToken 
      });
      
      onConnected(accessToken);
      toast({
        title: "Conectado com sucesso!",
        description: "Sua conta Google foi conectada e os dados estão sendo carregados.",
      });
      
      logger.info("AUTH", "Processo de conexão concluído com sucesso");
      
    } catch (error) {
      logger.error("AUTH", "Erro durante processo de conexão", error);
      
      let errorMessage = "Não foi possível conectar com sua conta Google.";
      
      if (error instanceof Error) {
        if (error.message.includes('Client ID não configurado')) {
          errorMessage = "Configuração Google não encontrada. Verifique o arquivo .env";
          logger.error("AUTH", "Erro de configuração - Client ID", { message: error.message });
        } else if (error.message.includes('Timeout')) {
          errorMessage = "Tempo limite excedido. Tente novamente.";
          logger.error("AUTH", "Timeout durante autenticação", { message: error.message });
        } else if (error.message.includes('não inicializado')) {
          errorMessage = "Erro na inicialização. Recarregue a página.";
          logger.error("AUTH", "Erro de inicialização", { message: error.message });
        } else {
          errorMessage = error.message;
          logger.error("AUTH", "Erro não categorizado", { 
            message: error.message,
            stack: error.stack 
          });
        }
      }
      
      toast({
        title: "Erro na conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      logger.debug("AUTH", "Processo de conexão finalizado", { isLoading: false });
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-success">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Conectado ao Google Sheets</span>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? "Conectando..." : "Conectar Google Sheets"}
    </Button>
  );
};