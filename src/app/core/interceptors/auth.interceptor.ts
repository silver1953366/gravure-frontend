import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  // Utilisation de la méthode maintenant existante (getAuthToken)
  const authToken = authService.getAuthToken();

  // Si un jeton existe et si ce n'est PAS une requête de connexion/inscription (qui n'en ont pas besoin)
  if (authToken) {
    // Clone la requête et ajoute l'en-tête Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    // Poursuit la requête modifiée
    return next(authReq);
  }

  // Si pas de jeton, poursuit la requête originale
  return next(req);
};