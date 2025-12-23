import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface représentant une entrée unique dans le journal d'activité.
 */
export interface Activity {
    id: number;
    user_id: number;
    action: string;       // Ex: 'created', 'updated', 'deleted', 'login'
    model_type: string;   // Ex: 'App\\Models\\Order'
    model_id: number;
    data_snapshot: any;   // Les données JSON avant/après l'action
    ip_address: string;
    created_at: string;
    // Le "?" ici permet d'utiliser "activity.user?.name" dans le HTML sans erreur NG8107
    user?: { 
        id: number; 
        name: string; 
        email: string; 
    };
}

/**
 * Interface pour la structure de pagination native de Laravel.
 */
export interface PaginatedActivities {
    current_page: number;
    data: Activity[];
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    
    // Route API: Exclusivement réservée aux administrateurs
    private readonly apiUrl = `${environment.apiUrl}/admin/activities`; 

    constructor(private http: HttpClient) {}

    /**
     * GET: Récupère la liste paginée des activités avec filtres.
     * @param page Numéro de la page (Pagination Laravel)
     * @param userId Filtrer par l'ID d'un utilisateur spécifique
     * @param action Filtrer par type d'action (ex: 'deleted')
     */
    getActivities(page: number = 1, userId?: number, action?: string): Observable<PaginatedActivities> {
        let params = new HttpParams();
        params = params.set('page', page.toString());
        
        if (userId) {
            params = params.set('user_id', userId.toString());
        }
        if (action) {
            params = params.set('action', action);
        }
        
        // Envoi de la requête: GET /api/admin/activities?page=X&user_id=Y&action=Z
        return this.http.get<PaginatedActivities>(this.apiUrl, { params });
    }
    
    /**
     * GET: Récupère les détails complets d'une activité.
     * Utile pour charger un snapshot volumineux à la demande.
     */
    getActivityDetails(activityId: number): Observable<Activity> {
        return this.http.get<Activity>(`${this.apiUrl}/${activityId}`);
    }
}