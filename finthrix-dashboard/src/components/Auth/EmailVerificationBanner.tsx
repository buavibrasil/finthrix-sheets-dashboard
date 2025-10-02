import React, { useState } from 'react';
import { emailVerificationService } from '../../services/emailVerificationService';
import { useAuthStore } from '../../stores/authStore';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  email, 
  onDismiss 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuthStore();

  // Não mostra o banner se o email já foi verificado
  if (!isVisible || user?.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      setMessage('');
      
      const response = await emailVerificationService.resendVerificationEmail({ email });
      
      if (response.success) {
        setMessage('Email de verificação reenviado! Verifique sua caixa de entrada.');
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

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-yellow-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email não verificado
          </h3>
          
          <div className="mt-1 text-sm text-yellow-700">
            <p>
              Seu email <strong>{email}</strong> ainda não foi verificado. 
              Verifique sua caixa de entrada e clique no link de confirmação.
            </p>
            
            {message && (
              <p className="mt-2 font-medium">
                {message}
              </p>
            )}
          </div>
          
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Reenviando...' : 'Reenviar email'}
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-sm text-yellow-800 hover:text-yellow-900 focus:outline-none focus:underline"
            >
              Dispensar
            </button>
          </div>
        </div>
        
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={handleDismiss}
              className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              aria-label="Fechar banner"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;