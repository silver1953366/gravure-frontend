import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Assurez-vous que FormsModule est importé
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionService, Order } from '../../../../core/services/transaction.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-admin-order-detail',
    standalone: true,
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
    isProcessing = false;
    
    // Propriété utilisée par ngModel du template pour l'état actuel
    currentStatus: string | null = null; // <-- CORRECTION: Ajout de currentStatus
    
    // Propriété utilisée par *ngFor
    availableStatuses = ['pending_payment', 'processing', 'ready_for_pickup', 'completed', 'cancelled']; // <-- CORRECTION: Renommage pour correspondre au HTML

    statusLabels: { [key: string]: string } = {
        'pending_payment': 'En attente de Paiement',
        'processing': 'En Préparation',
        'ready_for_pickup': 'Prêt à Enlever',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
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
            } else {
                this.error = "ID de la commande manquant.";
                this.isLoading = false;
            }
        });
    }

    /**
     * Charge les détails de la commande.
     */
    loadOrderDetail(id: number): void {
        this.isLoading = true;
        this.error = null;
        this.transactionService.getOrderById(id).subscribe({
            next: (data: Order) => { 
                this.order = data;
                this.currentStatus = data.status; // <-- Initialiser currentStatus ici
                this.isLoading = false;
            },
            error: (err: HttpErrorResponse) => { 
                this.error = "Impossible de charger le détail de la commande. " + (err.message || 'Erreur inconnue');
                this.isLoading = false;
            }
        });
    }

    /**
     * Renvoie un label lisible pour un statut donné.
     * <-- CORRECTION: Ajout de getStatusLabel
     */
    getStatusLabel(status: string): string {
        return this.statusLabels[status] || status;
    }

    /**
     * Gère le changement de statut via le sélecteur.
     * <-- CORRECTION: Ajout/Renommage de onStatusChange
     */
    onStatusChange(newStatus: string): void {
        // La nouvelle valeur est déjà dans this.currentStatus grâce à [(ngModel)]
        if (!this.orderId || !this.order || this.order.status === newStatus) return;

        if (!confirm(`Confirmez-vous le changement de statut de la Commande #${this.orderId} à ${this.getStatusLabel(newStatus).toUpperCase()} ?`)) {
            // Si l'utilisateur annule, on revient à l'ancien statut
            this.currentStatus = this.order.status; 
            return;
        }

        this.isProcessing = true;
        this.error = null;

        this.transactionService.updateOrderStatus(this.orderId, newStatus).subscribe({
            next: (updatedOrder) => {
                this.order = updatedOrder; 
                this.successMessage = `Statut mis à jour à ${this.getStatusLabel(newStatus).toUpperCase()}.`;
                this.isProcessing = false;
            },
            error: (err: HttpErrorResponse) => {
                this.error = `Erreur lors de la mise à jour du statut: ${err.message || 'Erreur inconnue'}`;
                this.isProcessing = false;
                // Si l'API échoue, rétablir l'ancien statut
                this.currentStatus = this.order!.status; 
            }
        });
    }
}