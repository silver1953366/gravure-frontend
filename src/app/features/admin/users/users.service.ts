import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Assumer que l'URL de base y est définie

// Interface pour le modèle Utilisateur
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'controller' | 'client';
    created_at: string;
    is_admin?: boolean;
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

    /** POST: Crée un nouvel utilisateur */
    createUser(userData: any): Observable<User> {
        // Route API: POST /api/admin/users
        return this.http.post<User>(this.apiUrl, userData);
    }

    /** PUT: Met à jour un utilisateur existant */
    updateUser(userId: number, userData: any): Observable<User> {
        // Route API: PUT /api/admin/users/{id}
        return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
    }

    /** DELETE: Supprime un utilisateur */
    deleteUser(userId: number): Observable<void> {
        // Route API: DELETE /api/admin/users/{id}
        return this.http.delete<void>(`${this.apiUrl}/${userId}`);
    }
}