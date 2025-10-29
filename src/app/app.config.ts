import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 1. Importer HTTP
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor'; // 2. Importer l'Interceptor


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    // 3. Fournir le service HTTP et enregistrer l'Interceptor
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    )
  ]
};