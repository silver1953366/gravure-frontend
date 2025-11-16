// src/app/features/controller/profile/user-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ControllerUser {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'CONTROLLER' | 'CLIENT';
    phone: string | null;
    created_at: string;
    // Ajoutez ici des champs spécifiques (adresse de bureau, etc.)
}

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {
    // Supposons que l'API a un endpoint pour l'utilisateur actuellement connecté
    private readonly apiUrl = `${environment.apiUrl}/profile`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère les données de l'utilisateur connecté (le Controller). */
    getProfile(): Observable<ControllerUser> {
        return this.http.get<ControllerUser>(this.apiUrl);
    }

    /** PUT: Mise à jour simple du profil (simulée). */
    updateProfile(data: Partial<ControllerUser>): Observable<ControllerUser> {
        // En réalité, cette route serait protégée et renverrait l'utilisateur mis à jour
        return this.http.put<ControllerUser>(this.apiUrl, data);
    }
}