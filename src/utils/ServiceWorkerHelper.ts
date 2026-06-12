/**
 * Registriert den Service Worker für PWA Unterstützung
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/SpaceFleetInfinity/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    });
  }
}
