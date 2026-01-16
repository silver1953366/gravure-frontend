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
    CommonModule, 
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

  // URL API pour les téléchargements
  private attachmentBaseUrl = 'http://localhost:8000/api/attachments'; 

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (id) {
          return this.orderService.getOrder(id);
        }
        return of(null);
      })
    ).subscribe({
      next: (orderData) => {
        if (orderData) {
          // Ici, orderData contient déjà les objets material, shape, etc. 
          // si votre backend Laravel/Node utilise "with" ou "eager loading"
          this.order.set(orderData);
        } else {
          this.error.set("La commande est introuvable.");
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur chargement commande:", err);
        this.error.set("Impossible de récupérer les détails techniques.");
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Helper pour l'affichage sécurisé des spécifications techniques
   * Évite les erreurs si les relations sont absentes
   */
  get technicalDetails() {
    const o = this.order();
    return {
      material: o?.material?.name || 'Non spécifié',
      shape: o?.shape?.name || 'Standard',
      dimension: o?.material_dimension?.dimension_label || 'Dimensions sur mesure',
      quantity: o?.quantity || 0,
      description: o?.details_snapshot?.description || 'Aucune consigne particulière.'
    };
  }

  /**
   * Retourne une classe CSS basée sur le statut
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-default';
    // On retourne simplement le nom du statut pour le CSS
    return `status-${status}`;
  }

  /**
   * URL de téléchargement
   */
  getAttachmentDownloadUrl(attachmentId: number): string {
    return `${this.attachmentBaseUrl}/${attachmentId}/download`; 
  }

  handlePayment(): void {
    const currentOrder = this.order();
    if (currentOrder) {
      console.log("Démarrage paiement:", currentOrder.reference);
      // Logique de redirection vers passerelle de paiement
    }
  }
}