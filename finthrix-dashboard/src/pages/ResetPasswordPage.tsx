import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../components/Auth';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSuccess = () => {
    // Redirecionar para login após sucesso
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Se não há token, redirecionar para forgot password
  if (!token) {
    navigate('/forgot-password');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm 
        token={token}
        onSuccess={handleSuccess}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  );
};

export default ResetPasswordPage;