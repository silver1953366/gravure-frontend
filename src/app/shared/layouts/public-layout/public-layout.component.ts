import { Component, output, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Import du service AuthService pour les données utilisateur dans la navbar
import { AuthService } from '../../../core/services/auth.service'; 

// Imports des composants de structure
import { NavbarComponent } from '../../../catalog/shared/navbar/navbar.component';
import { FooterComponent } from '../../../catalog/shared/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent], 
  template: `
    <app-navbar 
        [userName]="currentUser()?.name || ''"
        (openLoginModal)="onOpenLoginModal()" 
        (openCartModal)="onOpenCartModal()"> 
    </app-navbar>

    <main class="main-content-public">
      <router-outlet (activate)="onActivate($event)"></router-outlet>
    </main>

    <app-footer></app-footer>
  `,
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
  private authService = inject(AuthService);

  // Données réactives pour la Navbar
  currentUser = this.authService.currentUser;
  
  // --- OUTPUTS RELAYÉS À APP.COMPONENT ---
  openLoginModalEvent = output<void>(); 
  openCartModalEvent = output<void>(); 

  /**
   * Capture l'activation des composants via le Router
   * Indispensable pour intercepter les clics sur le bouton "Connexion" du Carousel
   */
  onActivate(componentRef: any): void {
    // Si le composant enfant possède l'output openLoginModalEvent (cas du CatalogListComponent)
    if (componentRef.openLoginModalEvent) {
      componentRef.openLoginModalEvent.subscribe(() => {
        this.onOpenLoginModal();
      });
    }

    // On peut faire la même chose pour le panier si nécessaire dans d'autres pages
    if (componentRef.openCartModalEvent) {
      componentRef.openCartModalEvent.subscribe(() => {
        this.onOpenCartModal();
      });
    }
  }

  // --- MÉTHODES DE RÉÉMISSION ---
  
  onOpenLoginModal(): void {
    this.openLoginModalEvent.emit(); 
  }
  
  onOpenCartModal(): void {
    this.openCartModalEvent.emit(); 
  }
}