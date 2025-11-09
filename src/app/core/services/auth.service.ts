import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = environment.apiUrl || 'http://localhost:8000/api'; 
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_ROLE_KEY = 'user_role';

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Envoie les identifiants à l'API pour connexion.
   * La réponse contient le jeton d'accès et le rôle de l'utilisateur.
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/login`, credentials).pipe(
      tap((response: any) => {
        // 1. Stockage du jeton (Token)
        this.setToken(response.access_token);
        // 2. Stockage du rôle pour la gestion des permissions/redirection
        this.setUserRole(response.role); 
      })
    );
  }

  /**
   * Stocke le jeton dans le navigateur.
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Stocke le rôle dans le navigateur.
   */
  private setUserRole(role: string): void {
    localStorage.setItem(this.USER_ROLE_KEY, role);
  }

  /**
   * Récupère le jeton stocké.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Récupère le rôle stocké.
   */
  getUserRole(): string | null {
    return localStorage.getItem(this.USER_ROLE_KEY);
  }

  /**
   * Vérifie si l'utilisateur est connecté (présence du jeton).
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  /**
   * Déconnexion: supprime le jeton et le rôle, puis redirige vers la page de connexion.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);

    // Optionnel: informer le Backend de la révocation
    this.http.post(`${this.API_BASE_URL}/logout`, {}).subscribe({
      next: () => console.log('Déconnexion Backend OK'),
      error: (err) => console.error('Erreur Déconnexion Backend', err)
    });
    this.router.navigate(['/login']);
  }

  /**
   * Vérifie le rôle pour l'autorisation (RBAC)
   */
  hasRole(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    if (!userRole) {
      return false;
    }

    // L'Admin est généralement autorisé à faire tout ce que fait le Contrôleur
    if (requiredRole === 'controller') {
        return userRole === 'admin' || userRole === 'controller';
    }
    return userRole === requiredRole;
  }
}