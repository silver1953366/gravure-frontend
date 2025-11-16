import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ControllerInventoryService, InventoryItem } from '../../controller-inventory.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-inventory-list',
    templateUrl: './controller-inventory-list.component.html',
    styleUrls: ['./controller-inventory-list.component.css']
})
export class ControllerInventoryListComponent implements OnInit {
    inventoryItems: InventoryItem[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private inventoryService: ControllerInventoryService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchInventory();
    }

    fetchInventory(): void {
        this.isLoading = true;
        this.error = null;
        this.inventoryService.getInventoryList().subscribe({
            next: (data) => {
                this.inventoryItems = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement de l'inventaire", err);
                // Le 403 Forbidden est géré par l'intercepteur HTTP, mais gérons l'échec de chargement
                this.error = "Impossible de charger l'inventaire. Vérifiez votre accès.";
                this.isLoading = false;
            }
        });
    }

    // Navigation vers le détail (route Controller)
    goToDetail(id: number): void {
        this.router.navigate(['/controller/inventory', id]);
    }
}