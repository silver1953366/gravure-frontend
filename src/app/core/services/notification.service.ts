import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../environments/environment'; 

// Import des types
import { Notification, NotificationPayload, NotificationPagination } from '../models/notification.model';

/**
 * Interface pour harmoniser les réponses API
 */
interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private http = inject(HttpClient);
  
  // Signal pour le compteur de notifications non lues
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();
  
  // Routes API de base
  private readonly userApiUrl = `${environment.apiUrl}/notifications`; 
  private readonly adminApiUrl = `${environment.apiUrl}/admin/notifications`; 

  // ==========================================
  // --- Fonctions Administrateur (Gestion) ---
  // ==========================================

  /**
   * Récupère la liste des clients pour le menu déroulant.
   * Route : GET /api/admin/users/all
   */
  getUsersList(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]> | any[]>(`${environment.apiUrl}/admin/users/all`).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        return res && res.data ? res.data : [];
      })
    );
  }

  /**
   * Récupère l'historique global (Admin).
   * Route : GET /api/admin/notifications/all
   */
  getAllSystemNotifications(): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]> | any>(`${this.adminApiUrl}/all`).pipe(
      map(res => {
        // Gère le cas de la pagination Laravel (data: []) ou tableau brut
        if (res && res.data && Array.isArray(res.data)) return res.data;
        return Array.isArray(res) ? res : [];
      })
    );
  }

  /**
   * Envoie une notification manuelle.
   * Route : POST /api/admin/notifications/send-manual
   */
  sendNotification(data: NotificationPayload): Observable<any> {
    // Construction sécurisée du payload pour Laravel
    const payload = {
      // 1. On s'assure que user_ids est un TABLEAU d'entiers
      user_ids: Array.isArray(data.user_id) 
        ? data.user_id.map(id => Number(id)) 
        : [Number(data.user_id)],
      
      // 2. Champs obligatoires
      type: data.type,
      title: data.title,
      message: data.message,
      
      // 3. Champs optionnels
      link: data.link || null,
      resource_id: data.resource_id || null,
      resource_type: data.resource_type || null
    };

    return this.http.post<any>(`${this.adminApiUrl}/send-manual`, payload);
  }

  /**
   * Supprime une notification (Admin).
   */
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${notificationId}`);
  }

  // ==========================================
  // --- Fonctions Utilisateur (Client) ---
  // ==========================================

  /** Récupère les notifications de l'utilisateur connecté (avec pagination). */
  getUserNotifications(): Observable<NotificationPagination> {
    return this.http.get<NotificationPagination>(this.userApiUrl).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /** Récupère le nombre de messages non lus. */
  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.userApiUrl}/unread-count`);
  }

  /** Marque une notification comme lue. */
  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch<any>(`${this.userApiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /** Marque TOUT comme lu. */
  markAllAsRead(): Observable<any> {
    return this.http.post<any>(`${this.userApiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  /** Supprime une notification (Client). */
  destroyNotification(id: number): Observable<any> {
    return this.http.delete(`${this.userApiUrl}/${id}`).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /** Met à jour le compteur du BehaviorSubject. */
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (res) => this.unreadCountSubject.next(res.unread_count),
      error: (err) => console.error('Erreur compteur notifications', err)
    });
  }
}