// Fichier: src/app/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// La ligne d'import est critique
import { Observable, tap, of } from 'rxjs'; 
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  role: 'admin' | 'controller' | 'client';
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_BASE_URL = 'http://localhost:8000/api'; 
  private USER_TOKEN_KEY = 'auth_token';

// ... (imports et autres méthodes)

// Correction de la méthode login
login(credentials: any): Observable<any> {
  return this.http.post<any>(`${this.API_BASE_URL}/login`, credentials).pipe(
    // 👈 CORRECTION : Chercher 'access_token' au lieu de 'token'
    tap(response => { if (response.access_token) { this.setToken(response.access_token); } }) 
  );
}

// Correction de la méthode register
register(userData: any): Observable<any> {
  return this.http.post<any>(`${this.API_BASE_URL}/register`, userData).pipe(
    // 👈 CORRECTION : Chercher 'access_token' au lieu de 'token'
    tap(response => { if (response.access_token) { this.setToken(response.access_token); } })
  );
}

// ... (le reste du service reste inchangé)

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/user`);
  }
  
// Déconnexion : POST /api/logout
logout(): Observable<any> {
  // Le service se contente de retourner l'Observable de l'appel API ou un Observable vide.
  // La logique de nettoyage du jeton est déplacée vers le composant qui appelle cette fonction.
  return this.isLoggedIn() 
    ? this.http.post(`${this.API_BASE_URL}/logout`, {}) 
    : of(null);
}

  private setToken(token: string): void {
    localStorage.setItem(this.USER_TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.USER_TOKEN_KEY);
  }

  // Correction TS2339: Méthode isLoggedIn DOIT exister
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}