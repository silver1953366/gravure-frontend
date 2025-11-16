import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 

// 1. Assurez-vous que les chemins d'accès sont corrects par rapport à la racine 'app'
// J'ai corrigé les chemins d'accès pour des importations standard dans une structure Angular
import { HeaderComponent } from './catalog/shared/navbar/header/header.component'; 
import { FooterComponent } from '../app/catalog/shared/footer/footer.component'; // NOUVEL IMPORT
import { LoginRegisterModalComponent } from './features/auth/login-register-modal/login-register-modal.component'; 
import { AuthService } from './core/services/auth.service'; // Correction du chemin

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent, 
    FooterComponent, // Ajout du Footer
    LoginRegisterModalComponent 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private authService = inject(AuthService);
  
  title = 'E.M.E.S.';
  
  // État du modal de connexion/inscription
  isLoginModalOpen = signal(false);
  
  // Simulation de l'état de la sidebar (utile pour le CSS)
  isSidebarOpen = signal(false); // Initialisation à faux

  // État de connexion de l'utilisateur (utilisé pour le Header)
  isAuthenticated = this.authService.isAuthenticated;

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }
}