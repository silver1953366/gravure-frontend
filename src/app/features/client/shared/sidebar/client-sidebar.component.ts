import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// 🛑 FormsModule EST SUPPRIMÉ

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  // 🛑 Correction : FormsModule est retiré
  imports: [CommonModule, RouterLink], 
  templateUrl: './client-sidebar.component.html',
  styleUrls: ['./client-sidebar.component.css']
})
export class ClientSidebarComponent {
  
  @Input() isMini: boolean = false;
  // Émet l'événement de bascule vers le composant parent (Dashboard)
  @Output() toggleSidebar = new EventEmitter<void>(); 
  
  // 🛑 searchTerm EST SUPPRIMÉ
  
  navItems: NavItem[] = [
    { icon: 'fa-table-columns', label: 'Tableau de bord', route: '/client/dashboard' },
    { icon: 'fa-file-invoice', label: 'Mes Devis', route: '/client/quotes' },
    { icon: 'fa-truck', label: 'Mes Commandes', route: '/client/orders' },
    { icon: 'fa-heart', label: 'Mes Favoris', route: '/client/favorites' },
    { icon: 'fa-user-group', label: 'Mon Équipe', route: '/client/team' },
  ];

  // 🛑 onSearchChange EST SUPPRIMÉ
}