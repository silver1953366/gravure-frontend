// src/app/features/admin/orders/admin-order-detail/admin-order-detail.component.ts
// src/app/features/admin/orders/admin-order-detail/admin-order-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 🛑 IMPORT MANQUANT : Importer Router et RouterModule
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { TransactionService, Order } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  // 🛑 CORRECTION : Ajouter RouterModule aux imports
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, RouterModule], 
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.css']
})
export class AdminOrderDetailComponent implements OnInit {

    order: Order | null = null;
    isLoading = true;
    error: string | null = null;
    orderId: number | null = null;
    successMessage: string | null = null;

    availableStatuses: Order['status'][] = [
        'pending_payment', 
        'processing', 
        'ready_for_pickup', 
        'completed', 
        'cancelled'
    ];
    
    currentStatus: Order['status'] | undefined; 

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
            } else {
                this.error = "ID de la commande manquant.";
                this.isLoading = false;
            }
        });
    }

    loadOrderDetail(id: number): void {
        this.isLoading = true;
        this.error = null;
        this.transactionService.getOrderById(id).subscribe({
            next: (data: Order) => { 
                this.order = data;
                this.currentStatus = data.status;
                this.isLoading = false;
            },
            error: (err: any) => { 
                this.error = "Impossible de charger le détail de la commande. " + err.message;
                this.isLoading = false;
            }
        });
    }

    onStatusChange(newStatus: Order['status']): void {
        if (!this.orderId || this.order?.status === newStatus) return;
        
        const oldStatus = this.order!.status;
        this.order!.status = newStatus;
        this.successMessage = null;
        this.error = null;

        this.transactionService.updateOrderStatus(this.orderId, newStatus).subscribe({
            next: () => {
                this.successMessage = `Statut de la commande #${this.orderId} mis à jour à '${newStatus.toUpperCase()}' avec succès.`;
            },
            error: (err) => {
                this.error = `Erreur lors de la mise à jour du statut. Veuillez réessayer.`;
                this.order!.status = oldStatus; 
                this.currentStatus = oldStatus;
                console.error('API Error:', err);
            }
        });
    }

    getStatusLabel(status: Order['status']): string {
        switch (status) {
            case 'pending_payment': return 'Paiement en Attente';
            case 'processing': return 'En Production';
            case 'ready_for_pickup': return 'Prête à être Retirée';
            case 'completed': return 'Terminée/Livrée';
            case 'cancelled': return 'Annulée';
            default: return 'Inconnu';
        }
    }
}