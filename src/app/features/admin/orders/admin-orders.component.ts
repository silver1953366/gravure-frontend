import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- CORRECTION: Import de FormsModule
import { TransactionService, Order } from '../../../core/services/transaction.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    // CORRECTION: Ajout de FormsModule
    imports: [CommonModule, DatePipe, DecimalPipe, UpperCasePipe, FormsModule], 
    templateUrl: './admin-orders.component.html',
    styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {

    orders: Order[] = [];
    isLoading = true;
    error: string | null = null;
    successMessage: string | null = null;
    isProcessing = false;
    
    // CORRECTION: Renommage en availableStatuses
    availableStatuses = ['pending_payment', 'processing', 'ready_for_pickup', 'completed', 'cancelled']; 

    statusLabels: { [key: string]: string } = {
        'pending_payment': 'En attente de Paiement',
        'processing': 'En Préparation',
        'ready_for_pickup': 'Prêt à Enlever',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
    };

    constructor(private transactionService: TransactionService, private router: Router) {}

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.isLoading = true;
        this.error = null;
        this.transactionService.getAllOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.isLoading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.error = 'Erreur lors du chargement des commandes.';
                this.isLoading = false;
                console.error('API Error:', err);
            }
        });
    }
    
    goToDetails(id: number): void {
        this.router.navigate(['/admin/orders', id]);
    }

    /**
     * Renvoie un label lisible pour un statut donné.
     * <-- CORRECTION: Ajout de getStatusLabel
     */
    getStatusLabel(status: string): string {
        return this.statusLabels[status] || status;
    }

    /**
     * Met à jour le statut d'une commande directement depuis la liste.
     * <-- CORRECTION: Renommage en onStatusChange
     */
    onStatusChange(order: Order, newStatus: string): void {
        // Le code reste le même, mais le nom de la fonction est corrigé.
        if (order.status === newStatus) return;

        if (!confirm(`Changer le statut de la Commande #${order.id} à ${this.getStatusLabel(newStatus).toUpperCase()} ?`)) {
            // Recharger pour rétablir la valeur visuelle si l'utilisateur annule
            this.loadOrders(); 
            return;
        }

        this.isProcessing = true;
        this.error = null;
        this.successMessage = null;

        this.transactionService.updateOrderStatus(order.id, newStatus).subscribe({
            next: (updatedOrder) => {
                const index = this.orders.findIndex(o => o.id === updatedOrder.id);
                if (index !== -1) {
                    this.orders[index] = updatedOrder;
                }
                this.successMessage = `Statut de la Commande #${order.id} mis à jour à ${newStatus.toUpperCase()}.`;
                this.isProcessing = false;
            },
            error: (err: HttpErrorResponse) => {
                this.error = `Erreur lors de la mise à jour du statut de la commande #${order.id}.`;
                this.isProcessing = false;
                // Forcer le rechargement pour afficher le statut réel après l'échec
                this.loadOrders(); 
                console.error('API Error:', err);
            }
        });
    }
}