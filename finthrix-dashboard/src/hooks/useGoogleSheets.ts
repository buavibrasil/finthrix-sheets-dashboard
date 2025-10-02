import { useState, useEffect, useCallback } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';
import {
  GoogleSheetsAuthState,
  SpreadsheetInfo,
  RangeData,
  GoogleSheetsResponse,
  GoogleSheetsError
} from '../types/googleSheets';

interface UseGoogleSheetsReturn {
  // Estado de autenticação
  authState: GoogleSheetsAuthState;
  isLoading: boolean;
  error: GoogleSheetsError | null;
  
  // Métodos de autenticação
  initialize: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Métodos de planilhas
  getSpreadsheetInfo: (spreadsheetId: string) => Promise<SpreadsheetInfo | null>;
  readRange: (spreadsheetId: string, range: string) => Promise<RangeData | null>;
  writeRange: (spreadsheetId: string, range: string, values: (string | number | boolean)[][]) => Promise<boolean>;
  appendData: (spreadsheetId: string, range: string, values: (string | number | boolean)[][]) => Promise<boolean>;
  
  // Estado das operações
  isOperationLoading: boolean;
  clearError: () => void;
}

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [authState, setAuthState] = useState<GoogleSheetsAuthState>({
    isSignedIn: false,
    isInitialized: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [error, setError] = useState<GoogleSheetsError | null>(null);

  // Inicializa o serviço Google Sheets
  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.initialize();
      
      if (result.success) {
        setAuthState(googleSheetsService.getAuthState());
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao inicializar'
        });
      }
    } catch (err) {
      setError({
        code: 'INITIALIZATION_ERROR',
        message: 'Erro ao inicializar Google Sheets',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Faz login no Google
  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.signIn();
      
      if (result.success) {
        setAuthState(googleSheetsService.getAuthState());
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao fazer login'
        });
      }
    } catch (err) {
      setError({
        code: 'SIGN_IN_ERROR',
        message: 'Erro ao fazer login no Google',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Faz logout do Google
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.signOut();
      
      if (result.success) {
        setAuthState(googleSheetsService.getAuthState());
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao fazer logout'
        });
      }
    } catch (err) {
      setError({
        code: 'SIGN_OUT_ERROR',
        message: 'Erro ao fazer logout do Google',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtém informações de uma planilha
  const getSpreadsheetInfo = useCallback(async (spreadsheetId: string): Promise<SpreadsheetInfo | null> => {
    setIsOperationLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.getSpreadsheetInfo(spreadsheetId);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao obter informações da planilha'
        });
        return null;
      }
    } catch (err) {
      setError({
        code: 'GET_SPREADSHEET_ERROR',
        message: 'Erro ao obter informações da planilha',
        details: err
      });
      return null;
    } finally {
      setIsOperationLoading(false);
    }
  }, []);

  // Lê dados de um intervalo
  const readRange = useCallback(async (spreadsheetId: string, range: string): Promise<RangeData | null> => {
    setIsOperationLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.readRange(spreadsheetId, range);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao ler dados'
        });
        return null;
      }
    } catch (err) {
      setError({
        code: 'READ_RANGE_ERROR',
        message: 'Erro ao ler dados da planilha',
        details: err
      });
      return null;
    } finally {
      setIsOperationLoading(false);
    }
  }, []);

  // Escreve dados em um intervalo
  const writeRange = useCallback(async (
    spreadsheetId: string, 
    range: string, 
    values: (string | number | boolean)[][]
  ): Promise<boolean> => {
    setIsOperationLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.writeRange(spreadsheetId, range, values);
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao escrever dados'
        });
        return false;
      }
    } catch (err) {
      setError({
        code: 'WRITE_RANGE_ERROR',
        message: 'Erro ao escrever dados na planilha',
        details: err
      });
      return false;
    } finally {
      setIsOperationLoading(false);
    }
  }, []);

  // Adiciona dados ao final da planilha
  const appendData = useCallback(async (
    spreadsheetId: string, 
    range: string, 
    values: (string | number | boolean)[][]
  ): Promise<boolean> => {
    setIsOperationLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.appendData(spreadsheetId, range, values);
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao adicionar dados'
        });
        return false;
      }
    } catch (err) {
      setError({
        code: 'APPEND_DATA_ERROR',
        message: 'Erro ao adicionar dados na planilha',
        details: err
      });
      return false;
    } finally {
      setIsOperationLoading(false);
    }
  }, []);

  // Limpa erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Atualiza o estado de autenticação periodicamente
  useEffect(() => {
    const updateAuthState = () => {
      const currentState = googleSheetsService.getAuthState();
      setAuthState(currentState);
    };

    // Verifica o estado inicial
    updateAuthState();

    // Verifica periodicamente se o estado mudou
    const interval = setInterval(updateAuthState, 1000);

    return () => clearInterval(interval);
  }, []);

  // Inicializa automaticamente quando o componente é montado
  useEffect(() => {
    if (!authState.isInitialized && !isLoading) {
      initialize();
    }
  }, [authState.isInitialized, isLoading, initialize]);

  return {
    authState,
    isLoading,
    error,
    initialize,
    signIn,
    signOut,
    getSpreadsheetInfo,
    readRange,
    writeRange,
    appendData,
    isOperationLoading,
    clearError
  };
};