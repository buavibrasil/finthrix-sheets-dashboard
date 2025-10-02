import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';

// Schema de validação
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Nova senha é obrigatória')
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  token, 
  onSuccess, 
  onBackToLogin 
}) => {
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      clearError();
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsPasswordReset(true);
      reset();
      onSuccess?.();
    } catch (error) {
      // Erro já tratado no store
    }
  };

  if (isPasswordReset) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <header className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">FinThrix</h1>
            <p className="text-gray-600 mt-2">Senha redefinida com sucesso</p>
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
              Senha alterada com sucesso!
            </h2>
            
            <p className="text-gray-600 text-sm mb-6">
              Sua senha foi redefinida. Agora você pode fazer login com sua nova senha.
            </p>
          </div>

          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Ir para login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">FinThrix</h1>
          <p className="text-gray-600 mt-2">Redefinir senha</p>
        </header>

        <div className="mb-6">
          <p className="text-gray-600 text-sm text-center">
            Digite sua nova senha abaixo.
          </p>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-600 text-sm" id="reset-password-error">
              {error}
            </p>
          </div>
        )}

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-6"
          noValidate
          aria-describedby={error ? "reset-password-error" : undefined}
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha *
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error password-help' : 'password-help'}
              autoComplete="new-password"
            />
            <p id="password-help" className="text-xs text-gray-500 mt-1">
              Mínimo de 6 caracteres
            </p>
            {errors.password && (
              <p 
                className="text-red-500 text-sm mt-1" 
                id="password-error"
                role="alert"
                aria-live="polite"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha *
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p 
                className="text-red-500 text-sm mt-1" 
                id="confirm-password-error"
                role="alert"
                aria-live="polite"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={isLoading ? 'Redefinindo senha, aguarde...' : 'Redefinir senha'}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
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

export default ResetPasswordForm;