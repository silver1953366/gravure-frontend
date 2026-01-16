// src/app/features/controller/orders/order-detail/controller-order-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ControllerOrderService, Order } from '../../controller-order.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-order-detail',
    templateUrl: './controller-order-detail.component.html',
    styleUrls: ['./controller-order-detail.component.css']
})
export class ControllerOrderDetailComponent implements OnInit {
    
    order: Order | null = null;
    isLoading = true;
    error: string | null = null;
    orderId: number | null = null;
    
    // Statuts
    public readonly STATUS_PROCESSING = 'processing';
    public readonly STATUS_SHIPPED = 'shipped';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private orderService: ControllerOrderService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.error = "ID de commande manquant.";
                    return of(null);
                }
                this.orderId = +id;
                this.isLoading = true;
                this.error = null;
                return this.orderService.getOrderDetail(this.orderId);
            })
        ).subscribe({
            next: (data) => {
                this.order = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = "Impossible de charger les détails de la commande.";
                this.isLoading = false;
            }
        });
    }

    updateStatus(newStatus: string): void {
        if (!this.orderId || !confirm(`Confirmer le changement de statut vers "${newStatus}" ?`)) return;

        this.orderService.updateOrderStatus(this.orderId, newStatus).subscribe({
            next: (updatedOrder) => {
                this.order = updatedOrder; // Mettre à jour la vue locale
                alert(`Statut de la commande #${this.orderId} mis à jour.`);
            },
            error: (err) => {
                alert("Erreur: Échec de la mise à jour du statut.");
                console.error(err);
            }
        });
    }
}