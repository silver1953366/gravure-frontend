import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Imports des Modaux
import { LoginRegisterModalComponent } from './features/auth/login-register-modal/login-register-modal.component'; 
import { CartModalComponent } from './catalog/pages/cart-modal/cart-modal.component'; 

// Imports des Layouts pour la détection d'événements
import { PublicLayoutComponent } from './shared/layouts/public-layout/public-layout.component'; 
import { ClientLayoutComponent } from './features/client/shared/layout/client-layout.component'; // <--- AJOUTÉ

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule, 
        RouterOutlet, 
        LoginRegisterModalComponent,
        CartModalComponent 
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
    title = 'E.M.E.S Application';
    
    // Signals pour contrôler l'état des modaux
    isLoginModalOpen = signal(false);
    isCartModalOpen = signal(false); 

    // Souscriptions pour les Outputs
    private loginSubscription: any | null = null; 
    private cartSubscription: any | null = null;

    // --- Méthodes de gestion des Modaux ---
    openLoginModal(): void {
        this.isLoginModalOpen.set(true);
    }

    closeLoginModal(): void {
        this.isLoginModalOpen.set(false);
    }

    openCartModal(): void {
        this.isCartModalOpen.set(true);
    }

    closeCartModal(): void {
        this.isCartModalOpen.set(false);
    }
        
    /**
     * Intercepte l'activation d'un composant dans la router-outlet. 
     * Permet de brancher les événements du Panier et du Login selon le Layout actif.
     */
    onActivate(componentRef: any): void {
        this.cleanupSubscriptions();

        // Vérification du type de Layout injecté dans la route
        const isPublicLayout = componentRef instanceof PublicLayoutComponent;
        const isClientLayout = componentRef instanceof ClientLayoutComponent;

        if (isPublicLayout || isClientLayout) {
            
            // 1. Souscription au Panier (Commun aux deux Layouts)
            this.cartSubscription = componentRef.openCartModalEvent.subscribe(() => {
                this.openCartModal();
            });
            
            // 2. Souscription au Login (Uniquement sur le Layout Public)
            if (isPublicLayout) {
                this.loginSubscription = componentRef.openLoginModalEvent.subscribe(() => {
                    this.openLoginModal();
                });
            }
        }
    }

    /**
     * Nettoyage centralisé des souscriptions
     */
    private cleanupSubscriptions(): void {
        if (this.loginSubscription) {
            this.loginSubscription.unsubscribe();
            this.loginSubscription = null;
        }
        if (this.cartSubscription) { 
            this.cartSubscription.unsubscribe();
            this.cartSubscription = null;
        }
    }

    ngOnDestroy(): void {
        this.cleanupSubscriptions();
    }
}