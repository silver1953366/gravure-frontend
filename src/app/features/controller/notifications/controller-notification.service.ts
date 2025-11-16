// src/app/features/controller/notifications/controller-notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
    id: number;
    message: string;
    read: boolean;
    type: string; // Ex: 'order_status', 'inventory_low', 'quote_ready'
    created_at: string;
    link_url: string; // URL vers la ressource liée (ex: '/controller/orders/123')
}

@Injectable({
    providedIn: 'root'
})
export class ControllerNotificationService {
    // Supposons un endpoint générique /notifications
    private readonly apiUrl = `${environment.apiUrl}/notifications`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère les notifications pour l'utilisateur Controller. */
    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.apiUrl);
    }

    /** PUT: Marque une notification spécifique comme lue. */
    markAsRead(notificationId: number): Observable<Notification> {
        // Supposons une route PUT /api/notifications/{id}/read
        return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/read`, {});
    }
}