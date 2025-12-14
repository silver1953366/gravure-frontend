import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importation nécessaire

export const guestGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService); // Injection du service
    
    // ✅ Utilisation du AuthService pour vérifier si l'utilisateur est connecté
    const isAuthenticated = authService.isTokenPresent(); 
    const userRole = localStorage.getItem('user_role') || 'client'; 

    if (isAuthenticated) {
        // Si l'utilisateur est déjà connecté, on le redirige vers son tableau de bord
        switch (userRole) {
            case 'admin':
                // Redirige vers le chemin parent /admin (supposé être le dashboard admin)
                return router.navigate(['/admin']); 
            case 'controller':
                // Redirige vers le chemin parent /controller (supposé être le dashboard controller)
                return router.navigate(['/controller']);
            case 'client':
            default:
                // Redirige vers le chemin exact du dashboard client
                return router.navigate(['/client/dashboard']); 
        }
    } else {
        // Non connecté, l'accès à la route publique (login, register, etc.) est autorisé
        return true; 
    }
};