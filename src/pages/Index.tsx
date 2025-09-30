import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ResumoFinanceiro } from "@/components/financial/ResumoFinanceiro";
import { ContasFaturas } from "@/components/financial/ContasFaturas";
import { FluxoCaixa } from "@/components/financial/FluxoCaixa";
import { ConfigStatus } from "@/components/auth/ConfigStatus";
import { SystemMonitor } from "@/components/debug/SystemMonitor";
import { GoogleSheetsDiagnostic } from "@/components/debug/GoogleSheetsDiagnostic";
import { GoogleSheetsService } from "@/lib/google-sheets";
import { useDataSync } from "@/hooks/useInitializeStore";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/utils/logger";

const Index = () => {
  const [activeSection, setActiveSection] = useState("resumo");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger();
  const { syncData, isLoading, error, lastSync } = useDataSync();
  
  // Usuário simulado - em produção viria da autenticação Google
  const user = {
    name: "João Silva",
    email: "joao.silva@email.com",
    avatar: ""
  };

  const handleGoogleConnected = async (accessToken: string) => {
    logger.api("Iniciando validação de conexão com Google Sheets", { 
      tokenLength: accessToken?.length || 0 
    });
    
    setGoogleAccessToken(accessToken);
    setIsGoogleConnected(true);
    
    try {
      // Verificar se o Spreadsheet ID está configurado
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;
      logger.debug("API", "Verificando configuração do Spreadsheet ID", { 
        hasSpreadsheetId: !!spreadsheetId,
        isPlaceholder: spreadsheetId === "your-google-spreadsheet-id"
      });
      
      if (!spreadsheetId || spreadsheetId === "your-google-spreadsheet-id") {
        logger.error("API", "Spreadsheet ID não configurado ou é placeholder", { spreadsheetId });
        throw new Error('Google Spreadsheet ID não configurado. Configure VITE_GOOGLE_SPREADSHEET_ID no arquivo .env');
      }

      logger.info("API", "Configuração validada, testando conexão com planilha");
      toast({
        title: "Testando conexão...",
        description: "Verificando acesso aos dados da planilha...",
      });

      // Sincronizar dados usando o hook useDataSync
      await logger.measureTime("API", "Sincronização de dados", async () => {
        await syncData(accessToken);
      });
      
      logger.api("Dados sincronizados com sucesso");
      
      toast({
        title: "Conexão bem-sucedida!",
        description: "Dados do Google Sheets carregados e sincronizados com sucesso.",
      });
      
      logger.info("API", "Sincronização de dados concluída com sucesso");
      
    } catch (error) {
      logger.error("API", "Erro durante validação de conexão", error);
      
      let errorMessage = "Erro ao carregar dados da planilha.";
      
      if (error instanceof Error) {
        if (error.message.includes('Spreadsheet ID não configurado')) {
          errorMessage = "ID da planilha não configurado. Verifique o arquivo .env";
          logger.error("API", "Erro de configuração - Spreadsheet ID", { message: error.message });
        } else if (error.message.includes('404')) {
          errorMessage = "Planilha não encontrada. Verifique o ID da planilha.";
          logger.error("API", "Erro 404 - Planilha não encontrada", { message: error.message });
        } else if (error.message.includes('403')) {
          errorMessage = "Acesso negado. Verifique as permissões da planilha.";
          logger.error("API", "Erro 403 - Acesso negado", { message: error.message });
        } else if (error.message.includes('400')) {
          errorMessage = "Erro na estrutura da planilha. Verifique as abas 'Movimentações' e 'Contas'.";
          logger.error("API", "Erro 400 - Estrutura da planilha", { message: error.message });
        } else {
          errorMessage = error.message;
          logger.error("API", "Erro não categorizado", { 
            message: error.message,
            stack: error.stack 
          });
        }
      }
      
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsGoogleConnected(false);
      setGoogleAccessToken(null);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "resumo":
        return <ResumoFinanceiro />;
      case "contas":
        return <ContasFaturas />;
      case "fluxo":
        return <FluxoCaixa />;
      default:
        return <ResumoFinanceiro />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        user={user}
        onGoogleConnected={handleGoogleConnected}
        isGoogleConnected={isGoogleConnected}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ConfigStatus />
        
        {/* Componente de diagnóstico - apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <div className="mb-6">
            <GoogleSheetsDiagnostic />
          </div>
        )}
        
        {renderContent()}
      </main>
      
      <SystemMonitor />
    </div>
  );
};

export default Index;
