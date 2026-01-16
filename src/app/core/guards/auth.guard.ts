import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importation nécessaire

/**
 * Auth Guard: Vérifie si l'utilisateur est authentifié pour l'accès aux routes protégées.
 * Redirige vers la page de connexion si le jeton est absent.
 */
export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService); // Injection du service

    // Utilise la méthode centralisée du service pour vérifier la présence du jeton
    if (authService.isTokenPresent()) {
        // L'utilisateur est connecté et accède à une route protégée
        return true; 
    } else {
        // Si non connecté, rediriger VERS la page de connexion
        console.warn('Accès à une route protégée refusé. Redirection vers la connexion.');
        // Utilisation de createUrlTree pour créer une redirection
        return router.createUrlTree(['/auth/login']); 
    }
};