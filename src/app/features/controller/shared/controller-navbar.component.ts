// src/app/features/controller/shared/controller-navbar/controller-navbar.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-controller-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controller-navbar.component.html',
  styleUrls: ['./controller-navbar.component.css']
})
export class ControllerNavbarComponent {

    user: any = { name: 'Contrôleur de Production', role: 'Controller' }; 
    showNotificationDropdown = false;

    constructor(private router: Router) {}
    
    toggleNotificationDropdown(): void {
        this.showNotificationDropdown = !this.showNotificationDropdown;
    }

    onLogout(): void {
        // Logique de déconnexion spécifique au rôle (simulée)
        console.log("Déconnexion du Contrôleur simulée.");
        this.router.navigate(['/login']); 
    }
}