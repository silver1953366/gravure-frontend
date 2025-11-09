import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  // 📥 Propriété d'entrée pour déterminer si la sidebar est ouverte (contrôlée par le composant parent)
  @Input() isOpen: boolean = false; 
  
  // 📤 Événement de sortie pour demander la fermeture (e.g., clic sur le fond ou un lien)
  @Output() closeSidebar = new EventEmitter<void>();

  // Rôle de l'utilisateur pour la démo
  userRole: 'admin' | 'controller' | 'client' = 'client';
  isDarkMode: boolean = false;

  ngOnInit(): void {
    // Vérifie l'état initial du mode sombre du document
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  // 📜 Gère la logique de navigation en fermant la sidebar après un clic de lien (utile pour mobile)
  onLinkClick(): void {
    this.closeSidebar.emit();
  }

  // 🔒 Fonction de déconnexion simulée
  onLogout(): void {
    // Ici, vous ajouteriez la logique d'appel au service d'authentification pour la déconnexion
    console.log('Déconnexion simulée...');
    // Redirection vers la page de connexion après la déconnexion
    // Note: Vous devriez utiliser le Router ici pour une vraie navigation, mais la simulation suffit pour le moment.
    this.closeSidebar.emit();
  }
  
  // 🔗 Détermine dynamiquement les liens affichés selon le rôle
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

      default: // client ou utilisateur non authentifié
        return [
          // Liens publics simplifiés, utilisez des chemins sans préfixe client/admin pour la clarté des exemples
          { path: '/catalog', icon: 'fa-store', label: 'Catalogue' }, 
          { path: '/configurator', icon: 'fa-pen-ruler', label: 'Personnalisation' },
          { path: '/preview', icon: 'fa-eye', label: 'Aperçu' },
          { path: '/client/quotes', icon: 'fa-file-invoice', label: 'Mes devis' },
          { path: '/client/orders', icon: 'fa-bag-shopping', label: 'Commandes' },
          { path: '/client/favorites', icon: 'fa-heart', label: 'Favoris' },
          { path: '/client/profile', icon: 'fa-user', label: 'Profil' },
        ];
    }
  }
}