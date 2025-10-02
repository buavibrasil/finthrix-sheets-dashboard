import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';

// Schema de validação
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      clearError();
      await forgotPassword(data.email);
      setEmailSent(data.email);
      setIsEmailSent(true);
      reset();
    } catch (error) {
      // Erro já tratado no store
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <header className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">FinThrix</h1>
            <p className="text-gray-600 mt-2">Email enviado com sucesso</p>
          </header>

          <div className="text-center mb-6">
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
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Verifique seu email
            </h2>
            
            <p className="text-gray-600 text-sm mb-4">
              Enviamos um link para redefinir sua senha para:
            </p>
            
            <p className="text-blue-600 font-medium mb-6">
              {emailSent}
            </p>
            
            <p className="text-gray-500 text-xs">
              Não recebeu o email? Verifique sua caixa de spam ou tente novamente em alguns minutos.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmailSent('');
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Enviar novamente
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
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">FinThrix</h1>
          <p className="text-gray-600 mt-2">Recuperar senha</p>
        </header>

        <div className="mb-6">
          <p className="text-gray-600 text-sm text-center">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-600 text-sm" id="forgot-password-error">
              {error}
            </p>
          </div>
        )}

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-6"
          noValidate
          aria-describedby={error ? "forgot-password-error" : undefined}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="seu@email.com"
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p 
                className="text-red-500 text-sm mt-1" 
                id="email-error"
                role="alert"
                aria-live="polite"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={isLoading ? 'Enviando email de recuperação, aguarde...' : 'Enviar link de recuperação'}
          >
            {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        {onBackToLogin && (
          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              ← Voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;