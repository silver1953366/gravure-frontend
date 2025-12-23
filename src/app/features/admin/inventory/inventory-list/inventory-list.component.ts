import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Nécessaire pour le [(ngModel)] de recherche
import { InventoryService, InventoryItem } from '../inventory.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit {
  
  // Liste source (complète)
  inventory: InventoryItem[] = [];
  
  // États de l'interface
  isLoading = true;
  error: string | null = null;
  canAdministerInventory: boolean = true; 

  // --- Recherche & Pagination ---
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10; // Nombre d'éléments par page

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchInventory();
  }

  /**
   * Récupère les données depuis l'API Laravel
   */
  fetchInventory(): void {
    this.isLoading = true;
    this.error = null;

    this.inventoryService.getInventory().subscribe({
      next: (data: InventoryItem[]) => {
        this.inventory = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur de chargement:", err);
        this.error = "Impossible de récupérer les données du stock.";
        this.isLoading = false;
      }
    });
  }

  /**
   * FILTRE : Retourne les articles dont le nom du matériau correspond à la recherche
   */
  get filteredInventory(): InventoryItem[] {
    if (!this.searchTerm.trim()) {
      return this.inventory;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    return this.inventory.filter(item => {
      // On cherche dans le nom du matériau lié à la dimension
      const materialName = item.material_dimension?.material?.name?.toLowerCase() || '';
      return materialName.includes(searchLower);
    });
  }

  /**
   * PAGINATION : Découpe la liste filtrée pour n'afficher que la page actuelle
   */
  get paginatedInventory(): InventoryItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredInventory.slice(startIndex, endIndex);
  }

  /**
   * Calcul du nombre total de pages
   */
  get totalPages(): number {
    const total = this.filteredInventory.length;
    return Math.ceil(total / this.itemsPerPage) || 1;
  }

  /**
   * Navigation entre les pages
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Réinitialise la page lors d'une nouvelle recherche
   */
  onSearchChange(): void {
    this.currentPage = 1;
  }

  /**
   * Formate le nom complet de l'article pour le tableau
   */
  getItemDisplayName(item: InventoryItem): string {
    const dim = item.material_dimension;
    if (!dim) return 'Article non configuré';
    
    const matName = dim.material?.name || 'Inconnu';
    const shapeName = dim.shape?.name || 'Inconnue';
    
    return `${matName} - ${shapeName}`;
  }

  getDimensionLabel(item: InventoryItem): string {
    return item.material_dimension?.dimension_label || 'N/A';
  }

  /**
   * Détermine la classe CSS pour le badge de statut
   */
  getStockStatusClass(item: InventoryItem): string {
    const available = item.available_quantity;
    const minimum = item.minimum_threshold;

    if (available <= 0) return 'status-empty';
    if (available <= (minimum / 2)) return 'status-alert';
    if (available <= minimum) return 'status-low';
    return 'status-ok';
  }

  /**
   * Suppression d'un article
   */
  onDeleteItem(itemId: number): void {
    if (confirm("Voulez-vous vraiment supprimer cet article du stock ?")) {
      this.inventoryService.deleteItem(itemId).subscribe({
        next: () => {
          this.inventory = this.inventory.filter(i => i.id !== itemId);
          // Si la page actuelle devient vide après suppression, on recule d'une page
          if (this.paginatedInventory.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: (err) => {
          alert("Erreur lors de la suppression.");
        }
      });
    }
  }

  // Navigation CRUD
  onEditItem(itemId: number): void {
    this.router.navigate(['/admin/inventory/edit', itemId]);
  }
  
  onCreateItem(): void {
    this.router.navigate(['/admin/inventory/create']);
  }
}