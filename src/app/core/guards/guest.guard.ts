import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    
    // SIMULATION
    const isAuthenticated = !!localStorage.getItem('auth_token'); 
    const userRole = localStorage.getItem('user_role') || 'client'; 

    if (isAuthenticated) {
        // Redirection IMMÉDIATE vers le domaine de l'utilisateur
        switch (userRole) {
            case 'admin':
                // Redirige vers /admin (qui est le chemin parent dans app.routes.ts)
                return router.navigate(['/admin']); 
            case 'controller':
                // Redirige vers /controller (qui est le chemin parent dans app.routes.ts)
                return router.navigate(['/controller']);
            case 'client':
            default:
                // Redirige vers le chemin exact
                return router.navigate(['/client/dashboard']); 
        }
    } else {
        return true; 
    }
};