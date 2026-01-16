import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Assumer que l'URL de base y est définie

// Interface pour le modèle Utilisateur (inchangée)
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'controller' | 'client';
    created_at: string;
    is_admin?: boolean;
}

// Interface pour le payload de création/mise à jour
export interface UserPayload {
    name: string;
    email: string;
    password?: string; // Optionnel
    role: 'admin' | 'controller' | 'client';
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    // Adapter l'URL de base si 'environment' n'est pas utilisé
    private readonly apiUrl = `${environment.apiUrl}/admin/users`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de tous les utilisateurs */
    getUsers(): Observable<User[]> {
        // Route API: GET /api/admin/users
        return this.http.get<User[]>(this.apiUrl);
    }
    
    /** GET: Récupère un utilisateur par son ID (Correction TS2339) */
    getUserById(userId: number): Observable<User> {
        // Route API: GET /api/admin/users/{id}
        return this.http.get<User>(`${this.apiUrl}/${userId}`);
    }

    /** POST: Crée un nouvel utilisateur */
    createUser(userData: UserPayload): Observable<User> { // Typage amélioré
        // Route API: POST /api/admin/users
        return this.http.post<User>(this.apiUrl, userData);
    }

    /** PUT: Met à jour un utilisateur existant */
    updateUser(userId: number, userData: Partial<UserPayload>): Observable<User> { // Typage pour payload partiel
        // Route API: PUT /api/admin/users/{id}
        return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
    }

    /** DELETE: Supprime un utilisateur */
    deleteUser(userId: number): Observable<void> {
        // Route API: DELETE /api/admin/users/{id}
        return this.http.delete<void>(`${this.apiUrl}/${userId}`);
    }
}