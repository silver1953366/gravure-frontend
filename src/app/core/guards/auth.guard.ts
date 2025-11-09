import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Auth Guard: Vérifie si l'utilisateur est authentifié.
 * Redirige vers /login s'il n'y a pas de token (ou si le token est invalide).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // SIMULATION: En réel, remplacer par un appel à un AuthService.
  const isAuthenticated = !!localStorage.getItem('auth_token'); 

  if (isAuthenticated) {
    return true;
  } else {
    // Si non connecté, rediriger vers la page de connexion
    return router.navigate(['/login']);
  }
};