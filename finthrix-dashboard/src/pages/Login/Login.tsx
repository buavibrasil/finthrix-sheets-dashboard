import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/Auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pegar a rota de origem para redirecionar após login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm 
          onSuccess={handleLoginSuccess} 
          onRegisterClick={handleRegisterClick}
          onForgotPasswordClick={handleForgotPasswordClick}
        />
    </div>
  );
};

export default Login;