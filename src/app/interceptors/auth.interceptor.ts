// Fichier: src/app/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // 1. La clé DOIT être 'auth_token'
  const TOKEN_KEY = 'auth_token'; 
  const token = localStorage.getItem(TOKEN_KEY); 
  
  // 2. Cloner la requête et ajouter l'en-tête
  if (token) {
    const cloned = req.clone({
      // L'en-tête DOIT être au format 'Bearer [espace] [jeton]'
      headers: req.headers.set('Authorization', `Bearer ${token}`) 
    });
    
    return next(cloned);
  }
  
  // 3. Sinon, continuer
  return next(req);
};