// src/app/catalog/pages/cart-modal/cart-modal.component.ts (Simplifié)

import { Component, inject, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { map } from 'rxjs'; // map est toujours utile pour les pipes si vous en avez

import { CartService } from '../../../core/services/cart.service';
import { Cart, CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe], 
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CartModalComponent {
  private cartService = inject(CartService);
  
  isOpen = input<boolean>(false);
  close = output<void>(); 

  // cart$ émettra immédiatement un Cart vide grâce à la correction du service
  cart$ = this.cartService.cart$;
  
  // NOTE : Nous n'avons plus besoin de isLoading$ car le premier état est un panier vide.
  // Si le chargement est long, le panier vide s'affichera immédiatement, puis il se mettra à jour.
  // Cependant, pour la *sécurité* si une erreur HTTP survient et que le service n'émet pas
  // immédiatement un panier vide, on peut le garder mais ce n'est plus nécessaire dans cette structure.
  // Je le retire pour simplifier, car le service garantit l'émission d'un objet.

  /**
   * Calcule le prix total des articles (hors taxes).
   */
  calculateTotalPrice(cart: Cart): number {
    if (!cart || !cart.items) return 0;
    
    return cart.items.reduce((total, item) => {
      return total + (item.fixed_unit_price_fcfa * item.quantity);
    }, 0);
  }

  // ... (Reste des actions onUpdateQuantity, onRemoveItem, onConvertToQuote, closeModal) ...
  onUpdateQuantity(item: CartItem, event: Event, cart: Cart): void { 
    // ... (Logique inchangée) ...
    const target = event.target as HTMLInputElement;
    let newQuantity = parseInt(target.value, 10);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1; 
        const currentItem = cart.items.find(i => i.id === item.id);
        if (currentItem) currentItem.quantity = 1;
    }

    if (newQuantity >= 1) {
      this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
         error: (err) => console.error("Erreur mise à jour quantité", err)
      });
    }
  }

  onRemoveItem(itemId: number): void {
    if (confirm("Êtes-vous sûr de vouloir retirer cet article ?")) {
      this.cartService.removeItem(itemId).subscribe({
         error: (err) => console.error("Erreur suppression article", err)
      });
    }
  }
  
  onConvertToQuote(): void {
    this.cartService.convertToQuote().subscribe({
        next: (response) => {
            console.log("Demande de devis créée:", response);
            this.close.emit();
        },
        error: (err) => {
            console.error("Erreur lors de la conversion en devis", err);
        }
    });
  }
  
  closeModal(): void {
    this.close.emit();
  }
}