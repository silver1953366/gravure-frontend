// src/app/features/client/profile/client-user-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientUser {
    id: number;
    name: string;
    email: string;
    role: 'CLIENT';
    phone: string | null;
    address: string | null; // Ajout important pour le client
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientUserProfileService {
    // Endpoint API standard pour l'utilisateur connecté
    private readonly apiUrl = `${environment.apiUrl}/profile`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère les données du client connecté. */
    getProfile(): Observable<ClientUser> {
        return this.http.get<ClientUser>(this.apiUrl);
    }

    /** PUT: Mise à jour des données du profil client. */
    updateProfile(data: Partial<ClientUser>): Observable<ClientUser> {
        return this.http.put<ClientUser>(this.apiUrl, data);
    }
}