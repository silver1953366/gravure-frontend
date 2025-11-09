import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Role Guard: Vérifie si l'utilisateur possède l'un des rôles requis (data: { roles: [...] }).
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as Array<string>;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Accès permis si aucun rôle n'est spécifié (après AuthGuard)
  }

  // SIMULATION: En réel, remplacer par un appel à un AuthService pour obtenir le rôle de l'utilisateur.
  const userRole = localStorage.getItem('user_role') || 'client'; 
  
  const isAuthorized = requiredRoles.includes(userRole);

  if (isAuthorized) {
    return true;
  } else {
    // Si rôle non autorisé, rediriger vers le dashboard par défaut (ou page 403)
    console.warn(`Accès refusé. Rôle requis: ${requiredRoles.join(', ')}, Rôle actuel: ${userRole}`);
    return router.navigate(['/client/dashboard']); 
  }
};