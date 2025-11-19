import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importation du service

/**
 * Auth Guard: Vérifie si l'utilisateur est authentifié pour l'accès aux routes protégées.
 * Redirige vers la page de connexion si le jeton est absent.
 */
export const authGuard: CanActivateFn = (route, state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthService); // Injection du service

    const userRole = localStorage.getItem('user_role') || 'client'; 

    // ✅ CORRECTION : Utilisation de la méthode isTokenPresent()
    if (authService.isTokenPresent()) {
        
        // Ce bloc gère la redirection si un utilisateur connecté tente
        // d'accéder aux routes publiques (racine ou catalogue).
        // NOTA: Ce type de logique est généralement géré par un autre Guard (GuestGuard)
        // sur les routes publiques, non par le AuthGuard (qui protège les routes privées).
        if (state.url === '/' || state.url.startsWith('/catalog')) {
            
            // Redirection vers le dashboard approprié
            switch (userRole) {
                case 'admin':
                    return router.navigate(['/admin/dashboard']); 
                case 'controller':
                    return router.navigate(['/controller/dashboard']); 
                case 'client':
                default:
                    return router.navigate(['/client/dashboard']);
            }
        }
        
        return true; // L'utilisateur est connecté et accède à une route protégée
        
    } else {
        // Si non connecté, rediriger VERS la page de connexion
        console.warn('Accès à une route protégée refusé. Redirection vers la connexion.');
        return router.createUrlTree(['/auth/login']); 
    }
};