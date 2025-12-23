import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Importation de vos modèles
import { Order } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/client/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule, // Indispensable pour *ngIf, *ngFor et les pipes de base
    RouterLink,
    DatePipe,
    DecimalPipe,
    UpperCasePipe
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  // Signaux pour la gestion d'état (Angular 17+)
  public order = signal<Order | null>(null);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // URL de base pour vos fichiers (à adapter selon votre environnement)
  private attachmentBaseUrl = 'http://localhost:8000/api/attachments'; 

  ngOnInit(): void {
    // On récupère l'ID depuis l'URL et on charge les données
    this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        if (id) {
          return this.orderService.getOrder(id);
        }
        return of(null);
      })
    ).subscribe({
      next: (orderData) => {
        if (orderData) {
          this.order.set(orderData);
        } else {
          this.error.set("La commande est introuvable.");
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur commande:", err);
        this.error.set("Impossible de charger les détails de la commande.");
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Retourne une classe CSS basée sur le statut de la commande
   */
  getStatusClass(status: Order['status'] | undefined): string {
    if (!status) return 'status-default';
    
    const baseClass = 'status-pill ';
    const statusMap: Record<string, string> = {
      'paid': 'bg-status-paid',
      'completed': 'bg-status-paid',
      'pending_payment': 'bg-status-pending',
      'processing': 'bg-status-processing',
      'shipped': 'bg-status-processing',
      'canceled': 'bg-status-canceled'
    };

    return baseClass + (statusMap[status] || 'bg-gray-500');
  }

  /**
   * Génère l'URL de téléchargement pour les pièces jointes
   */
  getAttachmentDownloadUrl(attachmentId: number): string {
    return `${this.attachmentBaseUrl}/${attachmentId}/download`; 
  }

  /**
   * Action de paiement
   */
  handlePayment(): void {
    const currentOrder = this.order();
    if (currentOrder) {
      console.log("Initialisation du paiement pour la référence:", currentOrder.reference);
      // Ajoutez ici votre logique vers Stripe, Monetbil, etc.
    }
  }
}