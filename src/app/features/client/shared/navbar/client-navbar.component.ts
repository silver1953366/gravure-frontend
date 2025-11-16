import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  template: `
    <header class="navbar-header">
      <div class="flex items-center space-x-4">
        <button 
          (click)="toggleSidebar.emit()" 
          class="toggle-sidebar-button"
          aria-label="Toggle Sidebar"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <h1 class="text-xl font-semibold text-gray-800 ml-4 hidden sm:block">Espace Client</h1>
      </div>
      
      <div class="flex items-center space-x-4">
        <button class="notification-button" [routerLink]="['/client/dashboard']">
            <i class="fa-solid fa-bell"></i>
            <span class="badge">3</span>
        </button>

        <div class="user-avatar bg-primary-client" [routerLink]="['/client/profile']">AD</div>
      </div>
    </header>
  `,
  styleUrls: ['./client-navbar.component.css']
})
export class NavbarComponent {
  toggleSidebar = output<void>();
}