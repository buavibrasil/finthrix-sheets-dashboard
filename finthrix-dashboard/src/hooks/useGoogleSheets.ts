import { useState, useEffect, useCallback } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import {
  GoogleSheetsAuthState,
  SpreadsheetInfo,
  RangeData,
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
  console.log('[useGoogleSheets] Hook criado/re-renderizado');
  
  const [authState, setAuthState] = useState<GoogleSheetsAuthState>({
    isSignedIn: false,
    isInitialized: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [error, setError] = useState<GoogleSheetsError | null>(null);

  // Monitoramento de performance
  const { measureAsync, measureSync, getComponentMetrics } = usePerformanceMonitor('useGoogleSheets', {
    enabled: true,
    threshold: 10 // só monitora operações que demoram mais de 10ms
  });

  // Inicializa o serviço Google Sheets
  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await measureAsync('initialize', async () => {
        return await googleSheetsService.initialize();
      });
      
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
  }, [measureAsync]);

  // Faz login no Google
  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await measureAsync('signIn', async () => {
        return await googleSheetsService.signIn();
      });
      
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
  }, [measureAsync]);

  // Faz logout do Google
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await measureAsync('signOut', async () => {
        return await googleSheetsService.signOut();
      });
      
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
  }, [measureAsync]);

  // Obtém informações de uma planilha
  const getSpreadsheetInfo = useCallback(async (spreadsheetId: string): Promise<SpreadsheetInfo | null> => {
    setIsOperationLoading(true);
    setError(null);
    
    try {
      const result = await measureAsync('getSpreadsheetInfo', async () => {
        return await googleSheetsService.getSpreadsheetInfo(spreadsheetId);
      }, { spreadsheetId });
      
      if (result.success) {
        return result.data || null;
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
  }, [measureAsync]);

  // Lê dados de um intervalo
  const readRange = useCallback(async (spreadsheetId: string, range: string): Promise<RangeData | null> => {
    setIsOperationLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.readRange(spreadsheetId, range);
      
      if (result.success) {
        return result.data || null;
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
      setAuthState(prevState => {
        // Só atualiza se realmente mudou
        if (prevState.isSignedIn !== currentState.isSignedIn || 
            prevState.isInitialized !== currentState.isInitialized) {
          return currentState;
        }
        return prevState;
      });
    };

    // Verifica o estado inicial
    updateAuthState();

    // Verifica periodicamente se o estado mudou
    const interval = setInterval(updateAuthState, 1000);

    return () => clearInterval(interval);
  }, []);

  // Removido: inicialização automática que causava loop infinito
  // O usuário deve clicar no botão "Inicializar" manualmente

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
    clearError,
    // Métricas de performance
    getPerformanceMetrics: getComponentMetrics
  };
};