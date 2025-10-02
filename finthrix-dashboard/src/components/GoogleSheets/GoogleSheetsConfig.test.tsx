import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleSheetsConfig } from './GoogleSheetsConfig';
import { useGoogleSheets } from '../../hooks/useGoogleSheets';

// Mock do hook useGoogleSheets
vi.mock('../../hooks/useGoogleSheets');

const mockUseGoogleSheets = vi.mocked(useGoogleSheets);

describe('GoogleSheetsConfig', () => {
  const mockOnConfigChange = vi.fn();
  
  const defaultHookReturn = {
    authState: {
      isSignedIn: false,
      isInitialized: true
    },
    isLoading: false,
    isOperationLoading: false,
    error: null,
    initialize: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSpreadsheetInfo: vi.fn(),
    readRange: vi.fn(),
    writeRange: vi.fn(),
    appendData: vi.fn(),
    clearError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGoogleSheets.mockReturnValue(defaultHookReturn);
  });

  describe('estado não autenticado', () => {
    it('deve renderizar botão de login quando não autenticado', () => {
      render(<GoogleSheetsConfig onConfigChange={mockOnConfigChange} />);
      
      expect(screen.getByRole('button', { name: /conectar com google/i })).toBeInTheDocument();
    });

    it('deve chamar signIn quando botão de login é clicado', () => {
      const mockSignIn = vi.fn();
      mockUseGoogleSheets.mockReturnValue({
        ...defaultHookReturn,
        signIn: mockSignIn
      });

      render(<GoogleSheetsConfig onConfigChange={mockOnConfigChange} />);
      
      fireEvent.click(screen.getByRole('button', { name: /conectar com google/i }));
      
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  describe('estado autenticado', () => {
    beforeEach(() => {
      mockUseGoogleSheets.mockReturnValue({
        ...defaultHookReturn,
        authState: {
          isSignedIn: true,
          isInitialized: true
        }
      });
    });

    it('deve renderizar formulário de configuração quando autenticado', () => {
      render(<GoogleSheetsConfig onConfigChange={mockOnConfigChange} />);
      
      expect(screen.getByLabelText(/id ou url da planilha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /desconectar/i })).toBeInTheDocument();
    });

    it('deve chamar signOut quando botão desconectar é clicado', () => {
      const mockSignOut = vi.fn();
      mockUseGoogleSheets.mockReturnValue({
        ...defaultHookReturn,
        authState: {
          isSignedIn: true,
          isInitialized: true
        },
        signOut: mockSignOut
      });

      render(<GoogleSheetsConfig onConfigChange={mockOnConfigChange} />);
      
      fireEvent.click(screen.getByRole('button', { name: /desconectar/i }));
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('tratamento de erros', () => {
    it('deve exibir erro quando presente', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Erro de teste'
      };
      mockUseGoogleSheets.mockReturnValue({
        ...defaultHookReturn,
        error
      });

      render(<GoogleSheetsConfig onConfigChange={mockOnConfigChange} />);

      expect(screen.getByText('Erro de teste')).toBeInTheDocument();
    });
  });
});