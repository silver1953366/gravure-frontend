import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'; 

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], 
  templateUrl: './client-sidebar.component.html',
  styleUrls: ['./client-sidebar.component.css']
})
export class ClientSidebarComponent {
  private authService = inject(AuthService);

  @Input() isMini: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>(); 

  currentUser = this.authService.currentUser; 
  
  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '??';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  });

  navItems: NavItem[] = [
    { icon: 'fa-chart-pie', label: 'Tableau de bord', route: '/client/dashboard' },
    { icon: 'fa-file-invoice-dollar', label: 'Mes Devis', route: '/client/quotes' },
    { icon: 'fa-boxes-stacked', label: 'Mes Commandes', route: '/client/orders' },
    { icon: 'fa-heart', label: 'Mes Favoris', route: '/client/favorites' },
    { icon: 'fa-users-gear', label: 'Mon Équipe', route: '/client/team' },
    { icon: 'fa-book-open', label: 'Catalogue', route: '/catalog' },
  ];
}