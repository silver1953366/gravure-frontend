import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guest Guard: Empêche les utilisateurs connectés d'accéder aux pages /login ou /register.
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // SIMULATION: En réel, remplacer par un appel à un AuthService.
  const isAuthenticated = !!localStorage.getItem('auth_token'); 

  if (isAuthenticated) {
    // Si connecté, rediriger vers le dashboard par défaut (/client/dashboard)
    return router.navigate(['/client/dashboard']);
  } else {
    return true;
  }
};