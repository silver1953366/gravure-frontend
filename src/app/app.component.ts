import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
// NOTE: On n'importe pas 'Subscription' de 'rxjs' ici, car l'API 'output()' retourne 'OutputRefSubscription',
// que nous traitons comme 'any' pour la simplicité, évitant ainsi l'erreur TS2740.

import { LoginRegisterModalComponent } from './features/auth/login-register-modal/login-register-modal.component'; 
import { PublicLayoutComponent } from './shared/layouts/public-layout/public-layout.component'; 
import { CartModalComponent } from './catalog/pages/cart-modal/cart-modal.component'; // Import du modal Panier

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule, 
        RouterOutlet, 
        LoginRegisterModalComponent,
        CartModalComponent // Ajout du modal Panier
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
    title = 'E.M.E.S Application';
    
    // Signals pour contrôler l'état des modaux
    isLoginModalOpen = signal(false);
    isCartModalOpen = signal(false); // Signal pour le modal Panier

    // Souscriptions pour les Outputs, définies comme 'any' pour la compatibilité (OutputRefSubscription)
    private loginSubscription: any | null = null; 
    private cartSubscription: any | null = null;

    // --- Gestion du Modal de Connexion/Inscription ---
    openLoginModal(): void {
        this.isLoginModalOpen.set(true);
        console.log("Modal de connexion ouvert."); 
    }

    closeLoginModal(): void {
        this.isLoginModalOpen.set(false);
        console.log("Modal de connexion fermé."); 
    }

    // --- Gestion du Modal du Panier ---
    openCartModal(): void {
        this.isCartModalOpen.set(true);
        console.log("Modal du panier ouvert.");
    }

    closeCartModal(): void {
        this.isCartModalOpen.set(false);
        console.log("Modal du panier fermé.");
    }
        
    /**
     * Intercepte l'activation d'un composant dans la router-outlet. 
     * Utilisé ici pour souscrire aux événements de Layout (Navbar).
     */
    onActivate(componentRef: any): void {
        // Nettoyer les anciennes souscriptions (important lors du changement de route)
        if (this.loginSubscription) {
            this.loginSubscription.unsubscribe();
            this.loginSubscription = null;
        }
        if (this.cartSubscription) { 
            this.cartSubscription.unsubscribe();
            this.cartSubscription = null;
        }

        if (componentRef instanceof PublicLayoutComponent) {
            
            // 1. Souscrire à l'événement d'ouverture du modal de Connexion
            this.loginSubscription = componentRef.openLoginModalEvent.subscribe(() => {
                this.openLoginModal();
            });
            
            // 2. Souscrire à l'événement d'ouverture du modal du Panier
            this.cartSubscription = componentRef.openCartModalEvent.subscribe(() => {
                this.openCartModal();
            });
        }
    }

    /**
     * Assure le nettoyage des souscriptions lors de la destruction du composant racine.
     */
    ngOnDestroy(): void {
        if (this.loginSubscription) {
            this.loginSubscription.unsubscribe();
        }
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }
}