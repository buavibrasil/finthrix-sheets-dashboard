import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConfigItem {
  name: string;
  value: string | undefined;
  isValid: boolean;
  description: string;
}

export const ConfigStatus = () => {
  const configs: ConfigItem[] = [
    {
      name: "Google Client ID",
      value: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      isValid: !!(import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                 import.meta.env.VITE_GOOGLE_CLIENT_ID !== "your-google-client-id.apps.googleusercontent.com"),
      description: "Necessário para autenticação Google OAuth"
    },
    {
      name: "Google Spreadsheet ID",
      value: import.meta.env.VITE_GOOGLE_SPREADSHEET_ID,
      isValid: !!(import.meta.env.VITE_GOOGLE_SPREADSHEET_ID && 
                 import.meta.env.VITE_GOOGLE_SPREADSHEET_ID !== "your-google-spreadsheet-id"),
      description: "ID da planilha Google Sheets com os dados"
    },
    {
      name: "Supabase URL",
      value: import.meta.env.VITE_SUPABASE_URL,
      isValid: !!import.meta.env.VITE_SUPABASE_URL,
      description: "URL do projeto Supabase"
    },
    {
      name: "Supabase Key",
      value: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "Configurada" : undefined,
      isValid: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      description: "Chave pública do Supabase"
    }
  ];

  const allValid = configs.every(config => config.isValid);
  const hasInvalid = configs.some(config => !config.isValid);

  if (allValid) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Configuração Completa</AlertTitle>
        <AlertDescription className="text-green-700">
          Todas as configurações necessárias estão definidas.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasInvalid) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Configuração Incompleta</AlertTitle>
        <AlertDescription className="text-red-700">
          <div className="mt-2 space-y-2">
            <p>As seguintes configurações precisam ser definidas no arquivo .env:</p>
            <ul className="list-disc list-inside space-y-1">
              {configs.filter(config => !config.isValid).map(config => (
                <li key={config.name}>
                  <strong>{config.name}</strong>: {config.description}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              Consulte o arquivo <code>GOOGLE_SETUP.md</code> para instruções detalhadas.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Verificando Configuração</AlertTitle>
      <AlertDescription className="text-yellow-700">
        Verificando as configurações do sistema...
      </AlertDescription>
    </Alert>
  );
};