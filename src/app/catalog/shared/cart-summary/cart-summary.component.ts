// src/app/catalog/shared/cart-summary/cart-summary.component.ts

import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="openCartModal.emit()" class="cart-icon-btn" title="Voir le panier">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
      <span *ngIf="itemCount$ | async as count" class="item-count" [class.active]="count > 0">{{ count }}</span>
    </button>
  `,
  // Le CSS est intégré directement ici pour la simplicité et l'isolation
  styles: [`
    .cart-icon-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      color: white; 
      font-size: 1.5rem;
      padding: 0;
      width: 24px; 
      height: 24px; 
      margin-left: 10px;
      transition: opacity 0.2s;
    }
    .cart-icon-btn:hover {
        opacity: 0.8;
    }
    
    .item-count {
      position: absolute;
      top: -8px;
      right: -10px;
      background: gray;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1;
      min-width: 20px;
      text-align: center;
      transition: background 0.3s;
    }
    .item-count.active {
      background: #ef4444; /* Rouge de notification */
    }
  `]
})
export class CartSummaryComponent {
  private cartService = inject(CartService);
  
  // OUTPUT : Émet au parent (Navbar) quand il faut ouvrir le modal
  openCartModal = output<void>();

  // Calcule le nombre total d'articles dans le panier
  itemCount$ = this.cartService.cart$.pipe(
    map(cart => cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0)
  );
}