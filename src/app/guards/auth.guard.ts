import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Ceci est la fonction de garde (AuthGuard)
export const authGuard: CanActivateFn = (route, state) => {
  // Injection des dépendances moderne
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Vérifie si l'utilisateur est connecté via le jeton stocké
  if (authService.isLoggedIn()) {
    // Si connecté, autorise l'accès à la route
    return true;
  } else {
    // 2. Si non connecté, redirige l'utilisateur vers la page de connexion
    router.navigate(['/login']);
    return false;
  }
};