import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
    // Structure du menu listant toutes les routes admin développées
    menus = [
        { label: 'Tableau de Bord', icon: '🏠', link: '/admin/dashboard' },
        { 
            label: 'Catalogue & Prix', 
            icon: '🏷️', 
            children: [
                { label: 'Dimensions Matériaux', link: '/admin/pricing' },
                { label: 'Matériaux', link: '/admin/materials' },
                { label: 'Formes', link: '/admin/shapes' },
                { label: 'Catégories', link: '/admin/categories' },
                { label: 'Règles de Remise', link: '/admin/discounts' }
            ]
        },
        { label: 'Inventaire', icon: '📦', link: '/admin/inventory' },
        { 
            label: 'Gestion Commerciale', 
            icon: '📈', 
            children: [
                { label: 'Devis (Quotes)', link: '/admin/quotes' },
                { label: 'Commandes', link: '/admin/admin-orders' },
            ]
        },
        { label: 'Utilisateurs', icon: '👥', link: '/admin/users' },
        { label: 'Rapports & Stats', icon: '📊', link: '/admin/reports' },
        { 
            label: 'Outils Système', 
            icon: '🛠️', 
            children: [
                { label: 'Journal d\'Activité', link: '/admin/activity-log' },
                { label: 'Notifications', link: '/admin/notifications' }
            ]
        }
    ];

    isSubMenuOpen: { [key: string]: boolean } = {};

    toggleSubMenu(label: string): void {
        this.isSubMenuOpen[label] = !this.isSubMenuOpen[label];
    }
}