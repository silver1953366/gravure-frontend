import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ClientUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    address: string | null;
    created_at: string;
}

// Interface pour correspondre au format de réponse du UserController@updateProfile
export interface UpdateProfileResponse {
    status: string;
    message: string;
    user: ClientUser;
}

@Injectable({
    providedIn: 'root'
})
export class ClientUserProfileService {
    private readonly userApiUrl = `${environment.apiUrl}/user`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère les données de l'utilisateur connecté */
    getProfile(): Observable<ClientUser> {
        return this.http.get<ClientUser>(this.userApiUrl);
    }

    /** PUT: Mise à jour des données du profil */
    updateProfile(data: Partial<ClientUser>): Observable<UpdateProfileResponse> {
        return this.http.put<UpdateProfileResponse>(this.userApiUrl, data);
    }
}