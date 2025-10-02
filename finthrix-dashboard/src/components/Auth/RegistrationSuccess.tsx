import React, { useState } from 'react';
import { emailVerificationService } from '../../services/emailVerificationService';

interface RegistrationSuccessProps {
  email: string;
  onBackToLogin?: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ 
  email, 
  onBackToLogin 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      setMessage('');
      
      const response = await emailVerificationService.resendVerificationEmail({ email });
      
      if (response.success) {
        setMessage('Email de verificação reenviado com sucesso!');
      } else {
        setMessage(response.message || 'Erro ao reenviar email');
      }
    } catch (error) {
      console.error('Erro ao reenviar:', error);
      setMessage(error instanceof Error ? error.message : 'Erro ao reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {/* Ícone de sucesso */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            FinThrix
          </h1>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conta criada com sucesso!
          </h2>
          
          <p className="text-gray-600 text-sm mb-4">
            Enviamos um email de verificação para:
          </p>
          
          <p className="text-blue-600 font-medium mb-6">
            {email}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-blue-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Próximos passos
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Verifique sua caixa de entrada</li>
                    <li>Clique no link de verificação</li>
                    <li>Faça login em sua conta</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.includes('sucesso') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Reenviando...' : 'Reenviar email de verificação'}
            </button>
            
            {onBackToLogin && (
              <button
                onClick={onBackToLogin}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Voltar ao login
              </button>
            )}
          </div>
          
          <p className="text-gray-500 text-xs mt-6">
            Não recebeu o email? Verifique sua caixa de spam ou clique em "Reenviar email de verificação".
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;