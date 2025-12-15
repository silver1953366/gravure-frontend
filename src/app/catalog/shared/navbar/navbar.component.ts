// src/app/catalog/shared/navbar/navbar.component.ts

import { Component, inject, output, signal, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service'; 
// Import du nouveau composant de résumé (sera intégré dans le HTML)
import { CartSummaryComponent } from '../cart-summary/cart-summary.component'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, FormsModule, CartSummaryComponent], // AJOUT DE CartSummaryComponent
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private layoutService = inject(LayoutService); 
  
  isSidebarOpen = this.layoutService.isSidebarOpen;

  @Input() userName: string = ''; 
  
  isLoggedIn = this.authService.isAuthenticated; 
  
  // Output pour le Modal de CONNEXION (Existant)
  openLoginModal = output<void>(); 
    
  // NOUVEL OUTPUT pour le Modal du PANIER (Doit être géré par le PublicLayout ou AppComponent)
  openCartModal = output<void>(); 

  // cartItemCount n'est plus un signal, il sera géré à l'intérieur de CartSummaryComponent
  // cartItemCount = signal(0); // <-- Peut être retiré

  onToggleSidebar(): void {
    this.layoutService.toggleSidebar(); 
  }

  onLoginClick(): void {
    this.openLoginModal.emit();
  }
    
  // NOUVELLE méthode appelée par l'enfant CartSummaryComponent
  onCartIconClick(): void {
      this.openCartModal.emit();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        console.error("Erreur lors de la déconnexion.", err);
      }
    });
  }
}