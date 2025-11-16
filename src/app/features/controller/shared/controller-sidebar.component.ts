import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-controller-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './controller-sidebar.component.html',
  styleUrls: ['./controller-sidebar.component.css']
})
export class ControllerSidebarComponent {
    // Structure du menu pour le Contrôleur
    menus = [
        { label: 'Tableau de Bord', icon: '🏠', link: '/controller/dashboard' },
        
        { 
            label: 'Gestion Commerciale', 
            icon: '📝', 
            children: [
                { label: 'Devis à Valider (Quotes)', link: '/controller/quotes' },
                { label: 'Commandes en Cours', link: '/controller/orders' },
            ]
        },
        
        { 
            label: 'Production & Stock', 
            icon: '📦', 
            children: [
                { label: 'Gestion d\'Inventaire', link: '/controller/inventory' },
                { label: 'Consultation Catalogue', link: '/controller/catalogue' }, 
                // 🛑 'Rapports de Production' est retiré.
            ]
        },

        { label: 'Clients & Utilisateurs', icon: '👥', link: '/controller/clients' },
        { label: 'Notifications', icon: '🔔', link: '/controller/notifications' },
        // NOUVEAU : Mon Profil
        { label: 'Mon Profil', icon: '👤', link: '/controller/profile' }, 
    ];

    isSubMenuOpen: { [key: string]: boolean } = {};

    toggleSubMenu(label: string): void {
        this.isSubMenuOpen[label] = !this.isSubMenuOpen[label];
    }
}