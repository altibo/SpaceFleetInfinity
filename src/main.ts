import { App } from './App';
import { registerServiceWorker } from './utils/ServiceWorkerHelper';

// Service Worker registrieren für PWA
registerServiceWorker();

// App initialisieren
const app = new App();

// Cleanup bei Seitenverlassen
window.addEventListener('beforeunload', () => {
  app.dispose();
});
