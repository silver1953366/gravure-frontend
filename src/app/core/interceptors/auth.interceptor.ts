// src/app/core/interceptor/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service'; // AJOUT


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
 
    const authService = inject(AuthService);
    const cartService = inject(CartService); 

    const authToken = authService.getAuthToken(); 
    const sessionToken = cartService.getSessionToken(); 

    let headers: { [key: string]: string } = {};
    
    // 1. Ajout du Jeton d'Authentification (Bearer)
   if (authToken) {
     headers['Authorization'] = `Bearer ${authToken}`;
   }
    
    // 2. Ajout du Jeton de Session (Anonyme/Fusion)
    // Nous l'ajoutons s'il est présent.
    if (sessionToken) {
         // Ce header permet à Laravel d'identifier le panier anonyme
         headers['X-Session-Token'] = sessionToken; 
    }

    // Clone la requête et ajoute tous les en-têtes
    const authReq = req.clone({
       setHeaders: headers
       });
    
  return next(authReq);
};