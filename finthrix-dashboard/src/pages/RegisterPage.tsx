import React, { useState } from 'react';
import { RegisterForm, LoginForm } from '../components/Auth';
import RegistrationSuccess from '../components/Auth/RegistrationSuccess';

const RegisterPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegisterSuccess = (email?: string) => {
    if (email) {
      setRegisteredEmail(email);
      setShowSuccess(true);
    } else {
      // Fallback para compatibilidade
      alert('Conta criada com sucesso! Verifique seu email para ativar a conta.');
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    // Redirecionar para dashboard ou página principal
    window.location.href = '/dashboard';
  };

  const handleBackToLogin = () => {
    setShowSuccess(false);
    setShowLogin(true);
  };

  if (showSuccess && registeredEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegistrationSuccess 
          email={registeredEmail}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onRegisterClick={() => setShowLogin(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm 
        onSuccess={handleRegisterSuccess}
        onLoginClick={() => setShowLogin(true)}
      />
    </div>
  );
};

export default RegisterPage;