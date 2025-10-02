import React, { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

interface PWANotificationsProps {
  className?: string;
}

export const PWANotifications: React.FC<PWANotificationsProps> = ({ className = '' }) => {
  const { 
    isInstallable, 
    isOffline, 
    updateAvailable, 
    installApp, 
    updateApp 
  } = usePWA();

  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [dismissedUpdate, setDismissedUpdate] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
      setDismissedInstall(true);
    } catch (error) {
      console.error('Erro ao instalar app:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
      setDismissedUpdate(true);
    } catch (error) {
      console.error('Erro ao atualizar app:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {/* Notificação de Status Offline */}
      {isOffline && (
        <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Modo Offline</p>
            <p className="text-xs opacity-90">Alguns recursos podem estar limitados</p>
          </div>
        </div>
      )}

      {/* Notificação de Instalação */}
      {isInstallable && !dismissedInstall && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Instalar App</p>
              <p className="text-xs opacity-90 mb-3">
                Instale o Finthrix para acesso rápido e experiência melhorada
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInstalling ? 'Instalando...' : 'Instalar'}
                </button>
                <button
                  onClick={() => setDismissedInstall(true)}
                  className="text-white/80 hover:text-white px-3 py-1 rounded text-xs"
                >
                  Agora não
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificação de Atualização */}
      {updateAvailable && !dismissedUpdate && (
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Atualização Disponível</p>
              <p className="text-xs opacity-90 mb-3">
                Uma nova versão do app está disponível
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Atualizando...' : 'Atualizar'}
                </button>
                <button
                  onClick={() => setDismissedUpdate(true)}
                  className="text-white/80 hover:text-white px-3 py-1 rounded text-xs"
                >
                  Depois
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};