import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Retirer les imports de NavbarComponent et FooterComponent
import { LoginRegisterModalComponent } from './features/auth/login-register-modal/login-register-modal.component'; 
import { PublicLayoutComponent } from './shared/layouts/public-layout/public-layout.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    LoginRegisterModalComponent,
    
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'E.M.E.S Application';
  isLoginModalOpen = signal(false);
  
  // 🛑 CORRECTION : Utilisation de 'any' pour la souscription de l'Output
  private subscription: any | null = null; 

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
    console.log("Modal de connexion ouvert."); 
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
    console.log("Modal de connexion fermé."); 
  }

  /**
   * 🚀 Intercepte l'activation d'un composant dans la router-outlet pour gérer la souscription à l'événement du modal.
   */
  onActivate(componentRef: any): void {
    // Nettoyer l'ancienne souscription
    if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
    }

    if (componentRef instanceof PublicLayoutComponent) {
        // Souscrire à l'événement openLoginModalEvent émis par le PublicLayout
        this.subscription = componentRef.openLoginModalEvent.subscribe(() => {
            this.openLoginModal();
        });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }
}