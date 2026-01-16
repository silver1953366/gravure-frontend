import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// Modèles et Services
import { Notification, NotificationPagination } from '../../../core/models/notification.model'; 
import { NotificationService } from '../../../core/services/notification.service'; 

@Component({
  selector: 'app-notification-client',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, UpperCasePipe, SlicePipe],
  templateUrl: './notification-client.component.html',
  styleUrl: './notification-client.component.css'
})
export class NotificationClientComponent implements OnInit {
  // Injection des services
  private notificationService = inject(NotificationService);

  // --- States (Signals) ---
  // On stocke la liste brute des notifications
  notifications = signal<Notification[]>([]);
  // On stocke les infos de pagination pour d'éventuels boutons "Suivant/Précédent"
  paginationInfo = signal<Omit<NotificationPagination, 'data'> | null>(null);
  
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // --- Computed Signals ---
  // Se met à jour automatiquement dès que 'notifications' change
  unreadCount = computed(() => this.notifications().filter(n => !n.is_read).length);

  ngOnInit(): void {
    this.loadNotifications();
  }

  /**
   * Charge les notifications depuis l'API Laravel paginée
   */
  loadNotifications(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.notificationService.getUserNotifications()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: NotificationPagination) => {
          // Laravel paginate() renvoie un objet avec 'data' contenant le tableau
          this.notifications.set(response.data);
          
          // On extrait le reste pour la pagination
          const { data, ...rest } = response;
          this.paginationInfo.set(rest);
        },
        error: (err) => {
          console.error('Erreur notifications:', err);
          this.error.set("Impossible de récupérer vos notifications pour le moment.");
        }
      });
  }

  /**
   * Action: Marquer comme lu
   */
  markAsRead(notification: Notification): void {
    if (notification.is_read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Mise à jour optimiste du Signal local
        this.notifications.update(items => 
          items.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        // Le service s'occupe de notifier le reste de l'app via unreadCount$
      },
      error: (err) => console.error('Erreur marquage lu:', err)
    });
  }

  /**
   * Action: Tout marquer comme lu
   */
  markAllAsRead(): void {
    if (this.unreadCount() === 0) return;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(items => 
          items.map(n => ({ ...n, is_read: true }))
        );
      }
    });
  }

  /**
   * Action: Suppression
   */
  deleteNotification(event: Event, id: number): void {
    // Empêche de déclencher le 'markAsRead' du parent lors du clic sur le bouton supprimer
    event.stopPropagation();

    if (!confirm('Voulez-vous supprimer cette notification ?')) return;

    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications.update(items => items.filter(n => n.id !== id));
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  /**
   * Helper: Style dynamique selon le type
   */
  getNotificationTheme(type: Notification['type']): string {
    const themes: Record<string, string> = {
      success: 'theme-success',
      warning: 'theme-warning',
      error: 'theme-error',
      info: 'theme-info'
    };
    return themes[type] || themes['info'];
  }
}