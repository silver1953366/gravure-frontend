import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  
  // Exemple : on pourrait récupérer dynamiquement le rôle depuis un service Auth plus tard
  userRole: 'admin' | 'controller' | 'client' = 'client';

  // Permet de déterminer dynamiquement les liens affichés selon le rôle
  get navLinks() {
    switch (this.userRole) {
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
          { path: '/admin/users', icon: 'fa-users', label: 'Utilisateurs' },
          { path: '/admin/materials', icon: 'fa-cubes', label: 'Matériaux' },
          { path: '/admin/categories', icon: 'fa-tags', label: 'Catégories' },
          { path: '/admin/pricing', icon: 'fa-list', label: 'Catalogue' },
          { path: '/admin/reports', icon: 'fa-file-alt', label: 'Rapports' },
          { path: '/admin/notifications', icon: 'fa-bell', label: 'Notifications' },
        ];

      case 'controller':
        return [
          { path: '/controller/dashboard', icon: 'fa-gauge', label: 'Dashboard' },
          { path: '/controller/quotes', icon: 'fa-file-signature', label: 'Devis' },
          { path: '/controller/orders', icon: 'fa-boxes-packing', label: 'Commandes' },
          { path: '/controller/clients', icon: 'fa-user-group', label: 'Clients' },
          { path: '/controller/notifications', icon: 'fa-bell', label: 'Notifications' },
        ];

      default: // client
        return [
          { path: '/client/catalog', icon: 'fa-store', label: 'Catalogue' },
          { path: '/client/configurator', icon: 'fa-pen-ruler', label: 'Personnalisation' },
          { path: '/client/preview', icon: 'fa-eye', label: 'Aperçu' },
          { path: '/client/quotes', icon: 'fa-file-invoice', label: 'Mes devis' },
          { path: '/client/orders', icon: 'fa-bag-shopping', label: 'Commandes' },
          { path: '/client/favorites', icon: 'fa-heart', label: 'Favoris' },
          { path: '/client/profile', icon: 'fa-user', label: 'Profil' },
        ];
    }
  }
}
