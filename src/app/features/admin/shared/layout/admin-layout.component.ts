import { Component, OnInit, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Imports des composants admin
import { AdminSidebarComponent } from '../sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    AdminSidebarComponent,
    AdminNavbarComponent
  ], 
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {

  // Signaux pour l'état réactif de l'UI
  isSidebarMini = signal(false);
  isMobileOpen = signal(false);

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  /**
   * Adapte l'état de la sidebar selon la largeur de l'écran
   */
  private checkScreenSize() {
    const isMobile = window.innerWidth < 1024;
    // Si on passe en mobile, on désactive le mode mini pour avoir une sidebar pleine largeur au slide
    if (isMobile) {
      this.isSidebarMini.set(false);
    } else {
      // Si on repasse en desktop, on ferme le menu mobile
      this.isMobileOpen.set(false);
    }
  }

  /**
   * Bascule entre le mode mini (desktop) ou l'ouverture latérale (mobile)
   */
  toggleSidebar() {
    if (window.innerWidth < 1024) {
      this.isMobileOpen.update(v => !v);
    } else {
      this.isSidebarMini.update(v => !v);
    }
  }
}