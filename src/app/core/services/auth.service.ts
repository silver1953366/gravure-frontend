import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '../models/auth.model'; 
// Assurez-vous que le chemin vers auth.models est correct.

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // URL de base de votre API Laravel
  // ⚠️ ASSUREZ-VOUS QUE CETTE URL EST CORRECTE POUR VOTRE ENVIRONNEMENT
  private readonly API_URL = 'http://localhost:8000/api'; 
  
  // États de l'authentification (avec Signals)
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);

  constructor() {
    this.loadInitialState();
  }

  /**
   * Charge l'état de l'utilisateur depuis le stockage local lors du démarrage.
   */
  private loadInitialState(): void {
    const token = this.getAuthToken();
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        // Une vérification du jeton (endpoint /user ou /me) pourrait être ajoutée ici
      } catch (e) {
        console.error("Erreur lors du chargement de l'utilisateur stocké.", e);
        this.logout(false); // Nettoyer en cas de données corrompues
      }
    }
  }
  
  // --- Méthodes API ---

  /**
   * Tente de connecter l'utilisateur via l'API Laravel.
   */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Tente d'inscrire un nouvel utilisateur via l'API Laravel.
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    // Le AuthController Laravel que vous avez montré n'a pas besoin de 'password_confirmation',
    // mais il est inclus dans le modèle pour être complet.
    const apiPayload = {
        name: payload.name,
        email: payload.email,
        password: payload.password
    };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, apiPayload).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Gère la déconnexion de l'utilisateur (révoque le jeton côté serveur et nettoie côté client).
   */
  logout(redirectToHome: boolean = true): Observable<any> {
    // Si l'utilisateur est authentifié, on tente de révoquer le jeton côté serveur.
    // L'intercepteur ajoutera le jeton Bearer automatiquement si l'état est "connecté".
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        // Nettoyage côté client après la révocation serveur
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        
        if (redirectToHome) {
            this.router.navigate(['/']); 
        }
      })
      // NOTE: L'erreur de déconnexion (par ex. jeton déjà expiré) peut être ignorée 
      // car le nettoyage local doit avoir lieu dans tous les cas.
    );
  }

  // --- Helpers Locaux ---
  
  /**
   * Récupère le jeton d'accès stocké localement.
   * Cette méthode est CRUCIALE pour l'Auth Interceptor.
   */
  public getAuthToken(): string | null {
      return localStorage.getItem('access_token');
  }

  /**
   * Traite la réponse réussie des endpoints /login et /register.
   */
  private handleAuthResponse(response: AuthResponse): void {
    const { user, access_token } = response;

    // 1. Stockage du jeton et de l'utilisateur
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // 2. Mise à jour des Signals
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    
    // 3. Fermer le modal et/ou naviguer (la navigation est généralement faite dans le modal/composant appelant)
  }
}