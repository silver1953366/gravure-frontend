import { Component, OnInit } from '@angular/core';
import { InventoryService, InventoryItem } from '../inventory.service'; // 🛑 CORRECTION du chemin
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Service hypothétique pour obtenir le rôle de l'utilisateur

interface UserAuth {
    isAdmin: boolean;
    isController: boolean;
}
const FAKE_AUTH_SERVICE = {
    getUserRoles(): UserAuth {
    // isAdmin: true pour tests CRUD Admin, false pour tests simple Controller/Consultation
    return { isAdmin: true, isController: true }; 
   }
};


@Component({
   standalone: true,
   imports: [CommonModule, RouterModule], 
   selector: 'app-inventory-list',
   templateUrl: './inventory-list.component.html',
   styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit {
   inventory: InventoryItem[] = [];
   isLoading = true;
   error: any = null;
 
 // Permission pour masquer/afficher les actions CRUD
    canAdministerInventory: boolean = false; 

    constructor(
      private inventoryService: InventoryService,
      private router: Router
    ) {}

    ngOnInit(): void {
        this.checkPermissions();
        this.fetchInventory();
    }
    
    checkPermissions(): void {
        const roles = FAKE_AUTH_SERVICE.getUserRoles();
        // L'admin a les droits CRUD. Le controller/logisticien a seulement les droits de lecture (fetchInventory)
        this.canAdministerInventory = roles.isAdmin; 
    }

    fetchInventory(): void {
        this.isLoading = true;
        this.error = null;
        this.inventoryService.getInventory().subscribe({
            next: (data) => {
                this.inventory = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement de l'inventaire", err);
                // 🛑 Erreur 403 (Accès refusé) ou autre. Indique à l'utilisateur de vérifier son rôle.
                this.error = "Impossible de charger l'inventaire. Accès Controller/Admin requis ou erreur serveur.";
                this.isLoading = false;
            }
        });
    }

    // 🎯 NOUVELLE MÉTHODE : Détermine l'état visuel du stock
    getStockStatusClass(item: InventoryItem): string {
        const available = item.available_quantity;
        const minimum = item.minimum_threshold;

        if (available <= 0) {
            return 'status-empty';
        } else if (available <= (minimum / 2)) {
            // Moins de la moitié du seuil minimum = Alerte Critique
            return 'status-alert';
        } else if (available <= minimum) {
            // Sous le seuil minimum = Stock Bas
            return 'status-low';
        }
        return 'status-ok'; // Stock OK
    }

    onDeleteItem(itemId: number): void {
        if (!this.canAdministerInventory) return;
        
        if (confirm("Êtes-vous sûr de vouloir supprimer cet article du stock ? Cette action est irréversible et nécessite le rôle Admin.")) {
            this.inventoryService.deleteItem(itemId).subscribe({
                next: () => {
                    this.inventory = this.inventory.filter(i => i.id !== itemId);
                    // Notification de succès
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression. Veuillez vérifier si vous avez la permission d'administrateur.");
                }
            });
        }
    }

    onEditItem(itemId: number): void {
        if (!this.canAdministerInventory) return;
        this.router.navigate(['/admin/inventory/edit', itemId]);
    }
    
    onCreateItem(): void {
        if (!this.canAdministerInventory) return;
        this.router.navigate(['/admin/inventory/create']);
    }
}