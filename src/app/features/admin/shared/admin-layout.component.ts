import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminNavbarComponent } from './admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent, AdminNavbarComponent],
  template: `
    <div class="admin-layout-wrapper">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="main-content">
        <app-admin-navbar></app-admin-navbar>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {}