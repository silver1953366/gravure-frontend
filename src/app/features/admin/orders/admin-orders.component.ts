// src/app/features/admin/orders/admin-orders.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Pour le select du statut
import { TransactionService, Order } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {

    orders: Order[] = [];
    isLoading = true;
    error: string | null = null;
    successMessage: string | null = null;

    // Liste des statuts disponibles pour la mise à jour (adaptée à votre API)
    availableStatuses: Order['status'][] = [
        'pending_payment', 
        'processing', 
        'ready_for_pickup', 
        'completed', 
        'cancelled'
    ];

    constructor(private transactionService: TransactionService) {}

    ngOnInit(): void {
        this.loadOrders();
    }

    /**
     * Charge toutes les commandes du système.
     */
    loadOrders(): void {
        this.isLoading = true;
        this.error = null;
        this.transactionService.getAllOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Erreur lors du chargement des commandes.';
                this.isLoading = false;
                console.error('API Error:', err);
            }
        });
    }

    /**
     * Met à jour le statut d'une commande.
     * @param order - La commande à modifier
     * @param newStatus - Le nouveau statut sélectionné (via le select)
     */
    onStatusChange(order: Order, newStatus: Order['status']): void {
        this.successMessage = null;
        this.error = null;
        
        // Empêcher l'appel API si le statut n'a pas changé
        if (order.status === newStatus) return;

        // Mise à jour de l'affichage local immédiatement pour un meilleur UX
        const oldStatus = order.status;
        order.status = newStatus;

        this.transactionService.updateOrderStatus(order.id, newStatus).subscribe({
            next: () => {
                this.successMessage = `Statut de la commande #${order.id} mis à jour à '${newStatus}' avec succès.`;
            },
            error: (err) => {
                this.error = `Erreur lors de la mise à jour du statut de la commande #${order.id}.`;
                console.error('API Error:', err);
                // Annuler la mise à jour locale en cas d'échec
                order.status = oldStatus;
            }
        });
    }
}