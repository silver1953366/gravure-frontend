// src/app/features/client/profile/client-user-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientUser {
    id: number;
    name: string;
    email: string;
    role: 'CLIENT'; // Assurez-vous que le backend renvoie bien 'CLIENT' ou convertissez-le si nécessaire
    phone: string | null;
    address: string | null;
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientUserProfileService {
    // CORRECTION FINALE : L'endpoint pour GET est /user
    private readonly userApiUrl = `${environment.apiUrl}/user`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère les données de l'utilisateur connecté (/api/user). */
    getProfile(): Observable<ClientUser> {
        // Appel vers /api/user
        return this.http.get<ClientUser>(this.userApiUrl);
    }

    /** PUT: Mise à jour des données du profil client.
     * Le backend Laravel utilise souvent aussi /user pour la mise à jour (PUT/PATCH).
     */
    updateProfile(data: Partial<ClientUser>): Observable<ClientUser> {
        // Appel vers /api/user pour la mise à jour
        return this.http.put<ClientUser>(this.userApiUrl, data);
    }
}