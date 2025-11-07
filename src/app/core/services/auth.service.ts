import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';

// Le rôle idéal pour l'interface de l'utilisateur (à mettre dans user.model.ts)
export type UserRole = 'admin' | 'controller' | 'client';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  // Autres champs...
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simule l'utilisateur connecté (pour les composants qui y souscrivent)
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private apiUrl = '/api'; // URL de base de votre API Laravel

  constructor(private http: HttpClient, private router: Router) {
    // Tente de charger les données stockées au démarrage
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Utilisé par le RoleGuard pour une vérification synchrone
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  // LOGIQUE DE CONNEXION (Exemple pour POST /api/login)
  login(credentials: any): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        const user: User = response.user;
        const token: string = response.token; 
        
        // Stockage sécurisé dans le local storage (pour persistance)
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  // LOGIQUE DE DÉCONNEXION
  logout(): void {
    // Appel API pour révoquer le token (bonne pratique)
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.performLocalLogout(),
      error: () => this.performLocalLogout() // Déconnexion locale même en cas d'échec API
    });
  }
  
  private performLocalLogout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  // VÉRIFICATION D'AUTHENTIFICATION (pour AuthGuard et Interceptor)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // RÉCUPÉRATION DU RÔLE ACTUEL (pour RoleGuard)
  getUserRole(): UserRole | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }
}