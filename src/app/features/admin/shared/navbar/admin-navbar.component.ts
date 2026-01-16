import { Component, output, inject, computed, input, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Services & Modèles
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit, OnDestroy {
  // --- Propriétés de communication ---
  isSidebarMini = input<boolean>(false);
  toggleSidebar = output<void>();

  // --- Injections ---
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  // --- États Réactifs (Signals) ---
  isProfileMenuOpen = signal(false);
  isNotificationMenuOpen = signal(false);
  
  // Données utilisateur issues du service d'authentification
  user = this.authService.currentUser;
  
  // Données de notifications système
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  // Stockage des abonnements pour éviter les fuites mémoire
  private subscriptions = new Subscription();

  // --- Computed Properties ---
  userInitials = computed(() => {
    const name = this.user()?.name || 'Admin';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  });

  // --- Cycle de vie ---
  ngOnInit(): void {
    // 1. Écoute du compteur de notifications globales via le service
    this.subscriptions.add(
      this.notifService.unreadCount$.subscribe({
        next: (count) => this.unreadCount.set(count)
      })
    );

    // 2. Premier chargement des notifications
    this.refreshNotifications();
  }

  ngOnDestroy(): void {
    // Désabonnement systématique à la destruction du composant
    this.subscriptions.unsubscribe();
  }

  /**
   * Récupère les dernières alertes système pour le menu déroulant
   */
  refreshNotifications(): void {
    this.notifService.getUserNotifications().subscribe({
      next: (response) => {
        // Gère les formats de réponse Laravel (paginé ou simple tableau)
        const data = Array.isArray(response) ? response : response.data;
        // On affiche les 6 dernières alertes pour l'administration
        this.notifications.set(data.slice(0, 6));
      },
      error: (err) => console.error('Erreur notifications admin:', err)
    });
  }

  /**
   * Gère l'ouverture du menu de notifications et son rafraîchissement
   */
  toggleNotificationMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen.set(false);
    this.isNotificationMenuOpen.update(v => !v);

    if (this.isNotificationMenuOpen()) {
      this.refreshNotifications();
    }
  }

  /**
   * Marque une alerte système comme lue
   */
  markAsRead(notif: Notification): void {
    if (notif.is_read) return;

    this.notifService.markAsRead(notif.id).subscribe({
      next: () => {
        this.notifications.update(list => 
          list.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
      }
    });
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isNotificationMenuOpen.set(false);
    this.isProfileMenuOpen.update(v => !v);
  }

  /**
   * Détection des clics extérieurs pour fermer les menus
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-wrapper')) {
      this.isProfileMenuOpen.set(false);
    }
    if (!target.closest('.notification-wrapper')) {
      this.isNotificationMenuOpen.set(false);
    }
  }

  /**
   * Déconnexion sécurisée
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isProfileMenuOpen.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Erreur déconnexion admin", err);
        this.router.navigate(['/login']);
      }
    });
  }
}