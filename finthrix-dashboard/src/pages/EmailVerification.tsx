import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { emailVerificationService } from '../services/emailVerificationService';
import { useAuthStore } from '../stores/authStore';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setMessage('Link de verificação inválido. Parâmetros obrigatórios não encontrados.');
      return;
    }

    verifyEmail();
  }, [email, token]);

  const verifyEmail = async () => {
    if (!email || !token) return;

    try {
      setStatus('loading');
      const response = await emailVerificationService.verifyEmail({ email, token });
      
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Email verificado com sucesso!');
        
        // Atualiza o usuário no store se retornado
        if (response.user) {
          setUser(response.user);
        }
        
        // Redireciona para o dashboard após 3 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Erro ao verificar email');
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('expirado') || errorMessage.includes('expired')) {
        setStatus('expired');
        setMessage('Link de verificação expirado. Solicite um novo link.');
      } else {
        setStatus('error');
        setMessage(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      const response = await emailVerificationService.resendVerificationEmail({ email });
      
      if (response.success) {
        setMessage('Novo email de verificação enviado! Verifique sua caixa de entrada.');
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

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
      case 'expired':
        return (
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verificando seu email...';
      case 'success':
        return 'Email verificado com sucesso!';
      case 'error':
        return 'Erro na verificação';
      case 'expired':
        return 'Link expirado';
      default:
        return 'Verificação de email';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {renderIcon()}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              FinThrix
            </h1>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {getTitle()}
            </h2>
            
            <p className="text-gray-600 text-sm mb-6">
              {message}
            </p>

            <div className="space-y-4">
              {status === 'success' && (
                <div className="text-sm text-gray-500">
                  Redirecionando para o dashboard em alguns segundos...
                </div>
              )}

              {status === 'expired' && email && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? 'Reenviando...' : 'Reenviar email de verificação'}
                </button>
              )}

              <Link
                to="/login"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;