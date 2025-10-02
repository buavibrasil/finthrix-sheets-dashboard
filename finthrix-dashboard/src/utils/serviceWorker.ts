// Utilitário para gerenciar Service Worker

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

export function registerSW(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Esta aplicação está sendo servida cache-first por um service worker.'
          );
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registrado com sucesso:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'Novo conteúdo está disponível e será usado quando todas as abas desta página forem fechadas.'
              );
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Conteúdo está em cache para uso offline.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
              
              if (config && config.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Erro durante o registro do Service Worker:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'Nenhuma conexão com a internet encontrada. Aplicação rodando em modo offline.'
      );
    });
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service Worker desregistrado com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao desregistrar Service Worker:', error);
      });
  }
}

export function clearCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    return caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Removendo cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }
  return Promise.resolve();
}

export function getCacheSize() {
  if ('caches' in window) {
    return caches.keys().then((cacheNames) => {
      let totalSize = 0;
      const promises = cacheNames.map((cacheName) => {
        return caches.open(cacheName).then((cache) => {
          return cache.keys().then((keys) => {
            return Promise.all(
              keys.map((key) => {
                return cache.match(key).then((response) => {
                  if (response) {
                    return response.blob().then((blob) => blob.size);
                  }
                  return 0;
                });
              })
            );
          }).then((sizes) => {
            const cacheSize = sizes.reduce((sum, size) => sum + size, 0);
            totalSize += cacheSize;
            return { cacheName, size: cacheSize };
          });
        });
      });
      
      return Promise.all(promises).then((cacheInfo) => ({
        totalSize,
        caches: cacheInfo
      }));
    });
  }
  return Promise.resolve({ totalSize: 0, caches: [] });
}