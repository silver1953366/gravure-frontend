import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/client/order.service';
import { Order } from '../../../../core/models/order.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
// CORRECTION: Assurez-vous que ce chemin est correct dans votre structure de dossier

@Component({
  selector: 'app-order-detail',
  standalone: true,
  templateUrl: '../order-details/order-details.component.html',
  styleUrl: '../order-details/order-details.component.css',
  // DatePipe et DecimalPipe sont nécessaires pour les pipes dans le template
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink] 
})
export class OrderDetailComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private attachmentBaseUrl = 'http://localhost:8000/api/attachments'; // Base URL pour le téléchargement

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const orderId = +params['id'];
        if (orderId) {
          return this.orderService.getOrder(orderId);
        }
        this.error.set("ID de commande non valide.");
        return of(null);
      })
    ).subscribe({
      next: (order) => {
        if (order) {
          this.order.set(order);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur de chargement des détails de la commande", err);
        this.error.set("Détails de la commande introuvables ou accès refusé.");
        this.isLoading.set(false);
      }
    });
  }

  // Fonction utilitaire pour le style (pour CSS standard)
  getStatusClass(status: Order['status']): string {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'status-pill bg-status-paid';
      case 'pending_payment':
        return 'status-pill bg-status-pending_payment';
      case 'processing':
      case 'shipped':
        return 'status-pill bg-status-processing';
      case 'canceled':
        return 'status-pill bg-status-canceled';
      default:
        return 'status-pill bg-status-gray';
    }
  }

  /**
   * Génère l'URL de téléchargement pour un fichier joint.
   */
  getAttachmentDownloadUrl(attachmentId: number): string {
    return `${this.attachmentBaseUrl}/${attachmentId}/download`; 
  }

  handlePayment(): void {
    alert("Redirection vers la passerelle de paiement pour l'ordre " + this.order()?.reference);
  }
}