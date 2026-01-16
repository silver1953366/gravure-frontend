import { Component, output, inject, computed, input, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../../core/services/cart.service';

// Modèles
import { Notification } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-client-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './client-navbar.component.html',
  styleUrls: ['./client-navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // --- Propriétés d'entrée / sortie ---
  isSidebarMini = input<boolean>(false);
  toggleSidebar = output<void>();
  openCartModal = output<void>(); 

  // --- Injection des services ---
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // --- États de l'interface (Signals) ---
  isProfileMenuOpen = signal(false);
  isNotificationMenuOpen = signal(false);
  
  // Données utilisateur (Signal provenant du service Auth)
  user = this.authService.currentUser;

  // Données dynamiques
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  cartCount = signal(0);

  // Gestion des abonnements RxJS
  private subscriptions = new Subscription();

  // --- Computed ---
  userInitials = computed(() => {
    const name = this.user()?.name || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  });

  // --- Cycle de vie ---
  ngOnInit(): void {
    // 1. Abonnement au compteur de notifications (Badge rouge)
    this.subscriptions.add(
      this.notifService.unreadCount$.subscribe(count => {
        this.unreadCount.set(count);
      })
    );

    // 2. Abonnement au panier (Badge vert)
    this.subscriptions.add(
      this.cartService.cart$.subscribe(cart => {
        if (cart && cart.items) {
          // Calcul du nombre total d'articles (somme des quantités)
          const total = cart.items.reduce((acc, item) => acc + item.quantity, 0);
          this.cartCount.set(total);
        } else {
          this.cartCount.set(0);
        }
      })
    );

    // Chargement initial des notifications pour le dropdown
    this.refreshNotifications();
  }

  ngOnDestroy(): void {
    // Nettoyage complet des abonnements pour éviter les fuites mémoire
    this.subscriptions.unsubscribe();
  }

  // --- Actions Notifications ---

  refreshNotifications(): void {
    this.notifService.getUserNotifications().subscribe({
      next: (response) => {
        // Supporte le format paginé Laravel ou un tableau simple
        const data = Array.isArray(response) ? response : response.data;
        this.notifications.set(data.slice(0, 5)); // Top 5
      },
      error: (err) => console.error('Erreur notifications navbar:', err)
    });
  }

  toggleNotificationMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen.set(false);
    this.isNotificationMenuOpen.update(v => !v);
    
    // Rafraîchir la liste à chaque ouverture du menu
    if (this.isNotificationMenuOpen()) {
      this.refreshNotifications();
    }
  }

  markAsRead(notif: Notification): void {
    if (notif.is_read) return;
    
    this.notifService.markAsRead(notif.id).subscribe({
      next: () => {
        // Mise à jour locale pour un retour visuel immédiat
        this.notifications.update(list => 
          list.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
      }
    });
  }

  // --- Actions Profil & UI ---

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isNotificationMenuOpen.set(false);
    this.isProfileMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Ferme les menus si on clique ailleurs
    if (!target.closest('.user-profile-wrapper')) {
      this.isProfileMenuOpen.set(false);
    }
    if (!target.closest('.notification-wrapper')) {
      this.isNotificationMenuOpen.set(false);
    }
  }

  openCart(): void {
    this.openCartModal.emit();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isProfileMenuOpen.set(false);
        this.cartService.clearCartData(); // Sécurité : vide le panier au logout
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        console.error("Erreur lors de la déconnexion", err);
        // On redirige quand même pour ne pas bloquer l'utilisateur
        this.router.navigate(['/catalog']);
      }
    });
  }
}