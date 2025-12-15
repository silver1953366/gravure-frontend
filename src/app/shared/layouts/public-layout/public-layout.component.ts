import { Component, output, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Import du service AuthService pour les données utilisateur dans la navbar
import { AuthService } from '../../../core/services/auth.service'; 

// 🛑 ASSUREZ-VOUS QUE CES CHEMINS D'IMPORTATION SONT CORRECTS
import { NavbarComponent } from '../../../catalog/shared/navbar/navbar.component';
import { FooterComponent } from '../../../catalog/shared/footer/footer.component'; // J'ai ajusté le chemin FooterComponent comme dans mes suggestions précédentes

@Component({
  selector: 'app-public-layout',
  standalone: true,
  // 1. Mise à jour de la liste imports (si le chemin FooterComponent a changé)
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent], 
  template: `
    <app-navbar 
        [userName]="currentUser()?.name || ''"
        (openLoginModal)="onOpenLoginModal()" 
        (openCartModal)="onOpenCartModal()"> </app-navbar>

    <main class="main-content-public">
      <router-outlet></router-outlet>
    </main>

    <app-footer></app-footer>
  `,
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
  private authService = inject(AuthService); // Injection requise pour les données de la Navbar

  // DONNÉES pour la Navbar
  currentUser = this.authService.currentUser;
  
  // OUTPUTS RÉ-ÉMIS VERS L'APP COMPONENT

  // Événement pour ouvrir le modal de Connexion/Inscription (Existant)
  openLoginModalEvent = output<void>(); 
  
  // 3. CORRECTION TS2339 : NOUVEL OUTPUT pour le modal Panier
  openCartModalEvent = output<void>(); 

  // MÉTHODES DE RÉÉMISSION
  
  onOpenLoginModal(): void {
    this.openLoginModalEvent.emit(); 
  }
  
  // Méthode de réémission pour le panier
  onOpenCartModal(): void {
    this.openCartModalEvent.emit(); 
  }
}