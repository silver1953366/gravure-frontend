// src/app/core/interceptor/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

/**
 * Intercepteur global pour l'authentification et la gestion des sessions de panier.
 * Utilise Injector pour éviter l'erreur NG0200 (Circular Dependency) car AuthService 
 * et CartService dépendent eux-mêmes de HttpClient.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    
    // 1. Récupération de l'injecteur au lieu des services en direct
    const injector = inject(Injector);
    
    // 2. Initialisation des headers
    let headers: { [key: string]: string } = {};

    try {
        // 3. Récupération des services à la demande (Lazy Loading manuel)
        const authService = injector.get(AuthService);
        const cartService = injector.get(CartService);

        // 4. Extraction des jetons
        const authToken = authService.getAuthToken(); 
        const sessionToken = cartService.getSessionToken(); 

        // 5. Ajout du Jeton d'Authentification (Bearer) pour les utilisateurs connectés
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // 6. Ajout du Jeton de Session (X-Session-Token) pour le panier anonyme ou fusionné
        if (sessionToken) {
            headers['X-Session-Token'] = sessionToken; 
        }
    } catch (e) {
        // En cas d'erreur lors de l'injection (phase d'initialisation précoce)
        console.warn('AuthInterceptor: Services non encore disponibles', e);
    }

    // 7. Clone la requête et applique les en-têtes accumulés
    const authReq = req.clone({
        setHeaders: headers
    });
    
    return next(authReq);
};