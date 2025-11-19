import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
    const router = inject(Router);
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = localStorage.getItem('user_role') || 'client'; 
    
    if (!requiredRoles || requiredRoles.length === 0) {
        return true; 
    }
    
    const isAuthorized = requiredRoles.includes(userRole);

    if (isAuthorized) {
        return true;
    } else {
        // Redirection vers le domaine de l'utilisateur s'il est non autorisé
        console.warn(`Accès refusé. Rôle requis: ${requiredRoles.join(', ')}, Rôle actuel: ${userRole}`);
        
        switch (userRole) {
            case 'admin':
                return router.navigate(['/admin']); 
            case 'controller':
                return router.navigate(['/controller']); // <--- Redirection critique
            case 'client':
            default:
                return router.navigate(['/client/dashboard']); 
        }
    }
};