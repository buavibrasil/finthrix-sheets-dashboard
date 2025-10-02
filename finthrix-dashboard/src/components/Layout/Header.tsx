import React from 'react';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">FinThrix</h1>
          </div>

          {/* User menu */}
          <nav className="flex items-center space-x-4" role="navigation" aria-label="Menu do usuário">
            {user && (
              <>
                <div className="flex items-center space-x-3" role="group" aria-label="Informações do usuário">
                  {/* Avatar */}
                  <div 
                    className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center"
                    role="img"
                    aria-label={`Avatar de ${user.name}`}
                  >
                    <span className="text-white text-sm font-medium" aria-hidden="true">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* User info */}
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900" id="user-name">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500" id="user-email">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label={`Sair da conta de ${user.name}`}
                  aria-describedby="user-name user-email"
                >
                  Sair
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;