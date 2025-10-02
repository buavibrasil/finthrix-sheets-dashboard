import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Key, 
  UserCheck, 
  Sheet, 
  Download,
  Info
} from 'lucide-react';

interface GoogleSheetsGuideProps {
  currentStep?: number;
  isAuthenticated?: boolean;
  hasConfig?: boolean;
  hasData?: boolean;
}

export const GoogleSheetsGuide: React.FC<GoogleSheetsGuideProps> = ({
  currentStep = 1,
  isAuthenticated = false,
  hasConfig = false,
  hasData = false
}) => {
  const steps = [
    {
      id: 1,
      title: "Credenciais Configuradas",
      description: "As credenciais do Google API estão configuradas no arquivo .env",
      icon: Key,
      completed: true, // Sempre true pois já verificamos que estão configuradas
      status: "Concluído"
    },
    {
      id: 2,
      title: "Autenticação com Google",
      description: "Faça login com sua conta Google na aba 'Configuração'",
      icon: UserCheck,
      completed: isAuthenticated,
      status: isAuthenticated ? "Concluído" : "Pendente"
    },
    {
      id: 3,
      title: "Configurar Planilha",
      description: "Selecione a planilha e aba que deseja importar",
      icon: Sheet,
      completed: hasConfig,
      status: hasConfig ? "Concluído" : "Pendente"
    },
    {
      id: 4,
      title: "Importar Dados",
      description: "Na aba 'Importar', visualize e importe os dados da planilha",
      icon: Download,
      completed: hasData,
      status: hasData ? "Concluído" : "Pendente"
    }
  ];

  const getStepIcon = (step: typeof steps[0]) => {
    const IconComponent = step.icon;
    if (step.completed) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStepBadge = (step: typeof steps[0]) => {
    if (step.completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
    }
    return <Badge variant="secondary">Pendente</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Guia de Importação</span>
        </CardTitle>
        <CardDescription>
          Siga estes passos para importar dados do Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  {getStepBadge(step)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!hasData && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximo passo:</strong> {
                !isAuthenticated 
                  ? "Clique em 'Conectar com Google' na aba de Configuração"
                  : !hasConfig 
                    ? "Configure sua planilha na aba de Configuração"
                    : "Vá para a aba 'Importar' para visualizar e importar os dados"
              }
            </AlertDescription>
          </Alert>
        )}

        {hasData && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Parabéns!</strong> Seus dados foram importados com sucesso. 
              Você pode visualizá-los na seção "Dados Importados" abaixo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};