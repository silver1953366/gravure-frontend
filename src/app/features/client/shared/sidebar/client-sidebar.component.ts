import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router'; 

@Component({
  selector: 'app-client-sidebar', 
  standalone: true,
  // C'EST L'IMPORT CRITIQUE QUI CORRIGE LE ROUTAGE DANS LE TEMPLATE
  imports: [CommonModule, RouterLink, RouterLinkActive, DatePipe], 
  templateUrl: './client-sidebar.component.html', 
  styleUrls: ['./client-sidebar.component.css']
})
export class ClientSidebarComponent { // La classe est bien nommée!
    
    // Ces inputs DOIVENT exister pour que le Dashboard (parent) puisse y lier les données
    @Input() userName: string = 'Utilisateur';
    @Input() memberSince: Date = new Date();
    @Input() isSidebarOpen: boolean = false; 
    @Output() closeSidebar = new EventEmitter<void>(); 

    navItems = [
        { label: 'Tableau de bord', path: '/client/dashboard', icon: 'tachometer-alt' },
        { label: 'Mes Commandes', path: '/client/orders', icon: 'box' },
        { label: 'Mon Compte', path: '/client/account', icon: 'user-circle' },
        { label: 'Paramètres', path: '/client/settings', icon: 'cog' },
    ];
}