import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
    id: number;
    user_id: number;
    type: 'info' | 'warning' | 'success' | 'error' | string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    user?: { id: number, name: string, email: string };
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    
    // Route API pour l'utilisateur courant (Client/Controller)
    private readonly userApiUrl = `${environment.apiUrl}/notifications`; 
    
    // Route API pour l'Admin (toutes les notifications)
    private readonly adminApiUrl = `${environment.apiUrl}/admin/notifications`; 

    constructor(private http: HttpClient) {}

    // --- Fonctions Utilisateur Courant (Client/Controller) ---

    /** GET: Récupère les notifications de l'utilisateur connecté. */
    getUserNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.userApiUrl);
    }

    /** PATCH: Marque une notification spécifique comme lue. */
    markAsRead(notificationId: number): Observable<Notification> {
        return this.http.patch<Notification>(`${this.userApiUrl}/${notificationId}`, { is_read: true });
    }
    
    /** * DELETE: Supprime une notification spécifique. 
     * Cette méthode était manquante ou mal typée dans l'erreur TS2339.
     */
    deleteNotification(notificationId: number): Observable<void> {
        return this.http.delete<void>(`${this.userApiUrl}/${notificationId}`);
    }


    // --- Fonctions Administrateur (Admin SEUL) ---

    /** GET: Récupère TOUTES les notifications du système (pour l'Admin). */
    getAllSystemNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.adminApiUrl);
    }
    
    /** POST: Crée et envoie une notification à un ou plusieurs utilisateurs. */
    sendNotification(data: { user_id: number | number[], type: string, title: string, message: string, link?: string }): Observable<any> {
        const payload = {
            ...data,
            user_id: Array.isArray(data.user_id) ? data.user_id : [data.user_id]
        };
        return this.http.post<any>(this.adminApiUrl, payload);
    }
}