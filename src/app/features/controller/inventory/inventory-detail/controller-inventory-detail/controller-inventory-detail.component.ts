// src/app/features/controller/inventory/inventory-detail/controller-inventory-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ControllerInventoryService, InventoryItem } from '../../controller-inventory.service';
import { switchMap } from 'rxjs/operators';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-inventory-detail',
    templateUrl: './controller-inventory-detail.component.html',
    styleUrls: ['./controller-inventory-detail.component.css']
})
export class ControllerInventoryDetailComponent implements OnInit {
    
    inventoryItem: InventoryItem | null = null;
    isLoading = true;
    error: string | null = null;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private inventoryService: ControllerInventoryService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.pipe(
            // Récupère l'ID depuis les paramètres de la route et change l'observable pour appeler le service
            switchMap(params => {
                const itemId = params.get('id');
                if (!itemId) {
                    throw new Error("ID d'article manquant dans l'URL.");
                }
                this.isLoading = true;
                this.error = null;
                return this.inventoryService.getInventoryItem(+itemId);
            })
        ).subscribe({
            next: (data) => {
                this.inventoryItem = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement de l'article", err);
                this.error = "Impossible de charger les détails de l'article. Il pourrait ne pas exister ou l'accès est refusé.";
                this.isLoading = false;
                // Rediriger vers la liste en cas d'erreur critique
                // this.router.navigate(['/controller/inventory']);
            }
        });
    }

    onBack(): void {
        this.router.navigate(['/controller/inventory']);
    }
}