import { Component, OnInit, HostListener, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Imports de vos composants internes
import { ClientSidebarComponent } from '../sidebar/client-sidebar.component';
import { NavbarComponent } from '../navbar/client-navbar.component'; 

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ClientSidebarComponent,
    NavbarComponent
  ], 
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css']
})
export class ClientLayoutComponent implements OnInit {

  // Signaux pour la gestion de la sidebar
  isSidebarMini = signal(false);
  isMobileOpen = signal(false);

  /**
   * Output pour remonter l'événement d'ouverture du panier vers AppComponent.
   * Doit avoir le même nom que celui utilisé dans la condition 'instanceof' de AppComponent.
   */
  openCartModalEvent = output<void>();

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      this.isSidebarMini.set(false);
    } else {
      this.isMobileOpen.set(false);
    }
  }

  /**
   * Gère l'ouverture/fermeture de la sidebar selon la résolution
   */
  toggleSidebar(event?: any) {
    if (window.innerWidth < 1024) {
      this.isMobileOpen.update(v => !v);
    } else {
      this.isSidebarMini.update(v => !v);
    }
  }

  /**
   * Déclenchée par l'output (openCartModal) de la NavbarComponent.
   * Ré-émet l'événement vers le haut (AppComponent).
   */
  onOpenCartModal(): void {
    this.openCartModalEvent.emit(); 
  }
}