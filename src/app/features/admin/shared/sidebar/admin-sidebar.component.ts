import { Component, input, output, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

// Services & Modèles
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Interface pour la structure du menu de navigation
 */
interface AdminNavItem {
  label: string;
  icon: string;
  link?: string;
  children?: { label: string; link: string }[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  // Services
  private authService = inject(AuthService);

  // --- Entrées / Sorties (Signal-based Inputs & Outputs) ---
  isMini = input<boolean>(false);
  toggleSidebar = output<void>();

  // --- États Réactifs ---
  currentUser = this.authService.currentUser;
  
  // État des sous-menus (Signal d'objet pour suivre quel menu est ouvert)
  openSubMenus = signal<{ [key: string]: boolean }>({});

  // --- Propriétés Calculées ---
  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'AD';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  });

  // --- Configuration du Menu ---
  readonly menus: AdminNavItem[] = [
    { 
      label: 'Tableau de Bord', 
      icon: 'fa-house', 
      link: '/admin/dashboard' 
    },
    { 
      label: 'Catalogue & Prix', 
      icon: 'fa-tags', 
      children: [
        { label: 'Dimensions & Prix', link: '/admin/pricing' },
        { label: 'Matériaux', link: '/admin/materials' },
        { label: 'Formes', link: '/admin/shapes' },
        { label: 'Règles de Remise', link: '/admin/discounts' },
        { label: 'Carrousel Accueil', link: '/admin/carousel' } // <--- NOUVEAU LIEN AJOUTÉ
      ]
    },
    { 
      label: 'Inventaire', 
      icon: 'fa-box', 
      link: '/admin/inventory' 
    },
    { 
      label: 'Gestion Commerciale', 
      icon: 'fa-chart-line', 
      children: [
        { label: 'Devis (Quotes)', link: '/admin/quotes' },
        { label: 'Commandes', link: '/admin/orders' },
      ]
    },
    { 
      label: 'Utilisateurs', 
      icon: 'fa-users', 
      link: '/admin/users' 
    },
    { 
      label: 'Rapports & Stats', 
      icon: 'fa-chart-bar', 
      link: '/admin/reports' 
    },
    { 
      label: 'Système', 
      icon: 'fa-gears', 
      children: [
        { label: 'Journal d\'Activité', link: '/admin/activity-log' },
        { label: 'Notifications', link: '/admin/notifications' }
      ]
    }
  ];

  /**
   * Alterne l'affichage des sous-menus
   * Si la sidebar est en mode réduit (mini), on l'ouvre d'abord pour voir le contenu
   */
  toggleSubMenu(label: string): void {
    if (this.isMini()) {
      this.toggleSidebar.emit();
    }
    
    this.openSubMenus.update(state => ({
      ...state,
      [label]: !state[label]
    }));
  }

  /**
   * Vérifie si un sous-menu spécifique est ouvert pour appliquer les classes CSS
   */
  isMenuOpen(label: string): boolean {
    return !!this.openSubMenus()[label];
  }
}