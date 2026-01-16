import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations'; // Import pour les animations

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration des routes
    provideRouter(routes),

    // Support du rendu côté serveur (SSR)
    provideClientHydration(),

    // Activation du moteur d'animations (Requis pour le carrousel premium)
    provideAnimations(),

    // Configuration HTTP avec l'intercepteur d'authentification
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    ),

    // Configuration du Service Worker (PWA) - Nettoyé (une seule instance)
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};