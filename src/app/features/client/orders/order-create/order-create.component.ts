import { Component, input, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // DecimalPipe ajouté
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/client/order.service';
import { Quote } from '../../../../core/models/client/quotes/quote.model'; 
import { Address, Order } from '../../../../core/models/order.model';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-order-create',
  standalone: true,
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.css',
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe] // DecimalPipe ajouté pour le template
})
export class OrderCreateComponent {
  confirmedQuote = input.required<Quote>();

  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private router = inject(Router);

  addressForm: FormGroup;
  
  submissionStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  submissionMessage = signal<string | null>(null);
  createdOrder = signal<Order | null>(null);

  constructor() {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      // CORRECTION: 'postal_code' doit correspondre à l'interface Address
      postal_code: ['', Validators.required], 
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.submissionMessage.set("Veuillez fournir une adresse de livraison complète.");
      return;
    }

    this.submissionStatus.set('loading');
    this.submissionMessage.set(null);

    const quoteId = this.confirmedQuote().id;
    // CORRECTION: Le type du payload utilise maintenant l'interface Address qui contient 'postal_code'.
    const payload: { shipping_address: Address } = {
        shipping_address: this.addressForm.value
    };

    this.orderService.convertQuoteToOrder(quoteId, payload).subscribe({
      next: (response) => {
        this.submissionStatus.set('success');
        this.createdOrder.set(response.order);
        this.submissionMessage.set(response.message + " Redirection vers la page de paiement...");
        
        setTimeout(() => {
            this.router.navigate(['/client/orders', response.order.id]); 
        }, 3000);
      },
      error: (err) => {
        console.error("Erreur de création de commande:", err);
        this.submissionStatus.set('error');
        const errorMessage = err.error?.error || "Échec de la conversion du devis en commande.";
        this.submissionMessage.set(errorMessage);
      }
    });
  }
}