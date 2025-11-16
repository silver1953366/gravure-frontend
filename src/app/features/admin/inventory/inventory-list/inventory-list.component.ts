import { Component, OnInit } from '@angular/core';
import { InventoryService, InventoryItem } from '../inventory.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Service hypothétique pour obtenir le rôle de l'utilisateur
// Remplacez par votre implémentation réelle (ex: AuthStore, AuthService, etc.)
// Assurez-vous d'importer et d'injecter ce service dans votre application
interface UserAuth {
    isAdmin: boolean;
    isController: boolean;
}
const FAKE_AUTH_SERVICE = {
    getUserRoles(): UserAuth {
        // TODO: Implémenter la logique pour récupérer les rôles de l'utilisateur connecté
        // Pour les tests, mettez isAdmin à true pour voir les boutons CRUD, ou false pour Controller
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
        const roles = FAKE_AUTH_SERVICE.getUserRoles(); // Utilisez votre service réel ici
        // Seuls les Admins peuvent administrer (CRUD) l'inventaire selon vos routes validées
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
                this.error = "Impossible de charger l'inventaire. Accès Controller/Admin requis.";
                this.isLoading = false;
            }
        });
    }

    onDeleteItem(itemId: number): void {
        if (!this.canAdministerInventory) return; // Sécurité frontend
        
        if (confirm("Êtes-vous sûr de vouloir supprimer cet article du stock ?")) {
            this.inventoryService.deleteItem(itemId).subscribe({
                next: () => {
                    this.inventory = this.inventory.filter(i => i.id !== itemId);
                    // Notification de succès
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression. Vérifiez les permissions (Admin requis).");
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