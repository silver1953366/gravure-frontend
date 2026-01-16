// src/app/features/controller/clients/controller-client.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string; // Devrait être 'CLIENT'
    // Ajoutez ici d'autres champs pertinents (adresse de facturation, etc.)
}

@Injectable({
    providedIn: 'root'
})
export class ControllerClientService {
    // Supposons une route API pour la lecture des utilisateurs/clients
    private readonly apiUrl = `${environment.apiUrl}/users`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste des utilisateurs clients. */
    getClients(): Observable<ClientUser[]> {
        // Le backend doit filtrer pour ne retourner que les utilisateurs ayant ROLE_CLIENT, 
        // ou le Controller est autorisé à tout voir et l'on filtre côté Angular si nécessaire.
        return this.http.get<ClientUser[]>(this.apiUrl);
    }
}