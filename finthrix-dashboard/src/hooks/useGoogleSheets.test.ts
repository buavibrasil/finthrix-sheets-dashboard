import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGoogleSheets } from './useGoogleSheets';
import { googleSheetsService } from '../services/googleSheetsService';

// Mock do serviço Google Sheets
vi.mock('../services/googleSheetsService', () => ({
  googleSheetsService: {
    initialize: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSpreadsheetInfo: vi.fn(),
    readRange: vi.fn(),
    writeRange: vi.fn(),
    appendData: vi.fn(),
    getAuthState: vi.fn(),
    isSignedIn: vi.fn()
  }
}));

const mockGoogleSheetsService = googleSheetsService as any;

describe('useGoogleSheets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Estado inicial padrão
    mockGoogleSheetsService.getAuthState.mockReturnValue({
      isSignedIn: false,
      isInitialized: true // Evita inicialização automática
    });
    mockGoogleSheetsService.isSignedIn.mockReturnValue(false);
    mockGoogleSheetsService.initialize.mockResolvedValue({
      success: true,
      data: true
    });
  });

  describe('inicialização', () => {
    it('deve ter função initialize disponível', () => {
      // Act
      const { result } = renderHook(() => useGoogleSheets());

      // Assert
      expect(typeof result.current.initialize).toBe('function');
    });
  });

  describe('signIn', () => {
    it('deve fazer login com sucesso', async () => {
      // Arrange
      mockGoogleSheetsService.signIn.mockResolvedValue({
        success: true,
        data: true
      });
      mockGoogleSheetsService.getAuthState.mockReturnValue({
        isSignedIn: true,
        isInitialized: true
      });

      const { result } = renderHook(() => useGoogleSheets());

      // Act
      await act(async () => {
        await result.current.signIn();
      });

      // Assert
      expect(mockGoogleSheetsService.signIn).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });
  });

  describe('signOut', () => {
    it('deve fazer logout com sucesso', async () => {
      // Arrange
      mockGoogleSheetsService.signOut.mockResolvedValue({
        success: true,
        data: true
      });
      mockGoogleSheetsService.getAuthState.mockReturnValue({
        isSignedIn: false,
        isInitialized: true
      });

      const { result } = renderHook(() => useGoogleSheets());

      // Act
      await act(async () => {
        await result.current.signOut();
      });

      // Assert
      expect(mockGoogleSheetsService.signOut).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });
  });

  describe('getSpreadsheetInfo', () => {
    it('deve obter informações da planilha com sucesso', async () => {
      // Arrange
      const spreadsheetInfo = {
        id: 'sheet123',
        name: 'Minha Planilha',
        url: 'https://docs.google.com/spreadsheets/d/sheet123',
        sheets: []
      };
      mockGoogleSheetsService.getSpreadsheetInfo.mockResolvedValue({
        success: true,
        data: spreadsheetInfo
      });

      const { result } = renderHook(() => useGoogleSheets());

      // Act
      let returnedInfo: any;
      await act(async () => {
        returnedInfo = await result.current.getSpreadsheetInfo('sheet123');
      });

      // Assert
      expect(mockGoogleSheetsService.getSpreadsheetInfo).toHaveBeenCalledWith('sheet123');
      expect(returnedInfo).toEqual(spreadsheetInfo);
      expect(result.current.error).toBeNull();
    });
  });

  describe('readRange', () => {
    it('deve ler dados do intervalo com sucesso', async () => {
      // Arrange
      const rangeData = {
        range: 'A1:C3',
        values: [['A', 'B', 'C'], ['1', '2', '3']],
        majorDimension: 'ROWS'
      };
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: true,
        data: rangeData
      });

      const { result } = renderHook(() => useGoogleSheets());

      // Act
      let returnedData: any;
      await act(async () => {
        returnedData = await result.current.readRange('sheet123', 'A1:C3');
      });

      // Assert
      expect(mockGoogleSheetsService.readRange).toHaveBeenCalledWith('sheet123', 'A1:C3');
      expect(returnedData).toEqual(rangeData);
      expect(result.current.error).toBeNull();
    });
  });

  describe('writeRange', () => {
    it('deve escrever dados no intervalo com sucesso', async () => {
      // Arrange
      mockGoogleSheetsService.writeRange.mockResolvedValue({
        success: true,
        data: { updatedCells: 4 }
      });

      const { result } = renderHook(() => useGoogleSheets());
      const values = [['A', 'B'], ['1', '2']];

      // Act
      let success: boolean;
      await act(async () => {
        success = await result.current.writeRange('sheet123', 'A1:B2', values);
      });

      // Assert
      expect(mockGoogleSheetsService.writeRange).toHaveBeenCalledWith('sheet123', 'A1:B2', values);
      expect(success!).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('appendData', () => {
    it('deve adicionar dados com sucesso', async () => {
      // Arrange
      mockGoogleSheetsService.appendData.mockResolvedValue({
        success: true,
        data: { updates: { updatedCells: 2 } }
      });

      const { result } = renderHook(() => useGoogleSheets());
      const values = [['C', 'D']];

      // Act
      let success: boolean;
      await act(async () => {
        success = await result.current.appendData('sheet123', 'A:B', values);
      });

      // Assert
      expect(mockGoogleSheetsService.appendData).toHaveBeenCalledWith('sheet123', 'A:B', values);
      expect(success!).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('deve ter função clearError disponível', () => {
      // Act
      const { result } = renderHook(() => useGoogleSheets());

      // Assert
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('estado inicial', () => {
    it('deve ter estado inicial correto', () => {
      // Act
      const { result } = renderHook(() => useGoogleSheets());

      // Assert
      expect(result.current.authState.isSignedIn).toBe(false);
      expect(result.current.authState.isInitialized).toBe(true); // Reflete o mock
      expect(result.current.isOperationLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});