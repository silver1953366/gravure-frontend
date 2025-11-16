import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Activity {
    id: number;
    user_id: number;
    action: string;       // Ex: 'created', 'updated', 'deleted'
    model_type: string;   // Ex: 'App\\Models\\Order'
    model_id: number;
    data_snapshot: any;   // Les données avant/après l'action
    ip_address: string;
    created_at: string;
    user: { id: number, name: string, email: string };
}

// Interface pour la pagination standard de Laravel
export interface PaginatedActivities {
    current_page: number;
    data: Activity[];
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    // ... autres champs de pagination
}

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    
    // Route API: CRUD pour l'activité (Admin SEUL)
    private readonly apiUrl = `${environment.apiUrl}/admin/activities`; 

    constructor(private http: HttpClient) {}

    /**
     * GET: Récupère la liste paginée des activités, avec filtres optionnels.
     * @param page Numéro de la page à charger.
     * @param userId Filtrer par ID utilisateur (optionnel).
     * @param action Filtrer par action (optionnel).
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
        
        // Route API: GET /api/admin/activities?page=...&user_id=...&action=...
        return this.http.get<PaginatedActivities>(this.apiUrl, { params });
    }
    
    /**
     * GET: Récupère les détails d'une activité spécifique.
     */
    getActivityDetails(activityId: number): Observable<Activity> {
        return this.http.get<Activity>(`${this.apiUrl}/${activityId}`);
    }
}