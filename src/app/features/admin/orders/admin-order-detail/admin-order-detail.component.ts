import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Import de VOTRE modèle complet
import { Order } from '../../../../core/models/order.model';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, UpperCasePipe, RouterModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.css']
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  orderId: number | null = null;
  successMessage: string | null = null;
  isProcessing = false;
  currentStatus: string | null = null; 

  availableStatuses = ['pending_payment', 'paid', 'processing', 'shipped', 'completed', 'canceled'];
  statusLabels: { [key: string]: string } = {
    'pending_payment': 'En attente de paiement',
    'paid': 'Payée',
    'processing': 'En préparation',
    'shipped': 'Expédiée',
    'completed': 'Terminée',
    'canceled': 'Annulée'
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.orderId = +idParam;
        this.loadOrderDetail(this.orderId);
      }
    });
  }

  loadOrderDetail(id: number): void {
    this.isLoading = true;
    this.transactionService.getOrderById(id).subscribe({
      // Utilisation de 'any' ici pour éviter le conflit de type avec le service
      next: (data: any) => { 
        this.order = data as Order; 
        this.currentStatus = this.order.status;
        this.isLoading = false;
      },
      error: () => { 
        this.error = "Erreur de chargement.";
        this.isLoading = false;
      }
    });
  }

  onPrint(): void { window.print(); }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  onStatusChange(newStatus: string): void {
    if (!this.orderId || !this.order || this.order.status === newStatus) return;
    if (!confirm(`Changer le statut ?`)) {
      this.currentStatus = this.order.status;
      return;
    }

    this.isProcessing = true;
    this.transactionService.updateOrderStatus(this.orderId, newStatus).subscribe({
      // Utilisation de 'any' ici pour éviter le conflit de type avec le service
      next: (updatedOrder: any) => {
        this.order = updatedOrder as Order; 
        this.currentStatus = this.order.status;
        this.successMessage = `Statut mis à jour.`;
        this.isProcessing = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = "Échec de la mise à jour.";
        this.isProcessing = false;
        if (this.order) this.currentStatus = this.order.status;
      }
    });
  }
}