// src/app/features/controller/orders/order-list/controller-order-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ControllerOrderService, Order } from '../../controller-order.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-order-list',
    templateUrl: './controller-order-list.component.html',
    styleUrls: ['./controller-order-list.component.css']
})
export class ControllerOrderListComponent implements OnInit {
    
    orders: Order[] = [];
    isLoading = true;
    error: string | null = null;
    
    // Statuts d'intérêt pour le Controller
    public readonly STATUS_PAID = 'paid';
    public readonly STATUS_PROCESSING = 'processing';
    public readonly STATUS_SHIPPED = 'shipped';

    constructor(
        private orderService: ControllerOrderService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchOrders();
    }

    fetchOrders(): void {
        this.isLoading = true;
        this.orderService.getOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = "Erreur de chargement. Accès non autorisé ou API non disponible.";
                this.isLoading = false;
            }
        });
    }

    goToDetail(id: number): void {
        this.router.navigate(['/controller/orders', id]);
    }
    
    startProcessing(orderId: number): void {
        if (confirm("Passer la commande en statut 'En Production' ?")) {
            this.orderService.updateOrderStatus(orderId, this.STATUS_PROCESSING).subscribe({
                next: () => {
                    this.fetchOrders(); // Recharger la liste pour voir le changement
                },
                error: (err) => {
                    alert("Erreur: Impossible de démarrer la production.");
                }
            });
        }
    }
}