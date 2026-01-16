// src/app/core/services/auth.service.ts

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs'; 
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; // Chemin ajusté
import { User, LoginPayload, RegisterPayload, AuthResponse } from '../models/auth.model';
import { CartService } from './cart.service'; // CRITIQUE: Import pour la gestion du panier

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private cartService = inject(CartService); // Injection du service panier

    private readonly API_URL = environment.apiUrl; 
    
    currentUser = signal<User | null>(null);
    isAuthenticated = signal(false); 

    constructor() {
        this.loadInitialState();
    }

    private loadInitialState(): void {
        const token = this.getAuthToken();
        const userJson = localStorage.getItem('user');
        
        if (token && userJson) {
            try {
                const user: User = JSON.parse(userJson);
                this.currentUser.set(user);
                this.isAuthenticated.set(true);
            } catch (e) {
                console.error("Erreur lors du chargement de l'utilisateur stocké.", e);
                this.removeAuthData();
            }
        }
    }
    
    // --- Méthodes API ---

    login(payload: LoginPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    register(payload: RegisterPayload): Observable<AuthResponse> {
        const apiPayload = {
            name: payload.name,
            email: payload.email,
            password: payload.password
        };
        
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, apiPayload).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.API_URL}/logout`, {}).pipe(
            tap(() => {
                this.removeAuthData();
                // ÉTAPE CRITIQUE: Nettoyer aussi les données de panier anonyme au logout
                this.cartService.clearCartData(); 
                this.router.navigate(['/catalog']); 
            }),
            catchError(error => {
                console.warn("Erreur serveur lors de la déconnexion. Forçage de la déconnexion locale.");
                this.removeAuthData();
                this.cartService.clearCartData(); // Nettoyage local forcé
                this.router.navigate(['/catalog']); 
                return of(null); 
            })
        );
    }

    // --- Méthodes de Gestion d'État ---

    private removeAuthData(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
    }

    public getAuthToken(): string | null {
        return localStorage.getItem('access_token');
    }
    
    public isTokenPresent(): boolean {
        return !!this.getAuthToken();
    }

    private handleAuthResponse(response: AuthResponse): void {
        // Déstructuration incluant le session_token
        const { user, access_token, session_token } = response; 

        // 1. Enregistrement des données d'authentification
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user_role', user.role || 'client');
        
        this.currentUser.set(user);
        this.isAuthenticated.set(true);

        // 2. LOGIQUE DE FUSION DU PANIER
        if (session_token) {
            console.log("Connexion/Inscription réussie. Tentative de fusion du panier anonyme.");
            // Le rechargement du panier (GET /api/cart) gère la fusion côté Laravel 
            // et met à jour l'état local du CartService.
            this.cartService.loadCart().subscribe();
        }
        
        // 3. Redirection
        this.redirectToDashboard();
    }

    /**
     * Redirige l'utilisateur vers la page de tableau de bord appropriée en fonction de son rôle.
     */
    public redirectToDashboard(): void {
        const role = localStorage.getItem('user_role');
        let dashboardPath: string;

        switch (role) {
            case 'admin':
                dashboardPath = '/admin/dashboard';
                break;
            case 'controller':
                dashboardPath = '/controller/dashboard';
                break;
            case 'client':
            default:
                dashboardPath = '/client/dashboard';
                break;
        }

        this.router.navigate([dashboardPath]);
    }
}