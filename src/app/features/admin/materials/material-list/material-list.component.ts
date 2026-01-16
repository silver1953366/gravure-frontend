import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

// Modèles
import { Material } from '../../../../core/models/material.model';
import { Category } from '../../../../core/models/category.model';

// Services
import { MaterialService } from '../material.service';
import { CatalogService } from '../../../../core/services/catalog/catalog.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule],
  selector: 'app-material-list',
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.css']
})
export class MaterialListComponent implements OnInit {
  // Injection des services via inject()
  private materialService = inject(MaterialService);
  private catalogService = inject(CatalogService);
  private router = inject(Router);

  // Données brutes
  materials: Material[] = [];
  categories: Category[] = [];
  
  // États de l'interface
  isLoading = true;
  error: string | null = null;

  // Filtres
  searchTerm: string = '';
  selectedCategoryId: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge simultanément les catégories pour le filtre et les matériaux
   */
  loadData(): void {
    this.isLoading = true;
    
    // 1. Charger les catégories pour le menu déroulant
    this.catalogService.getCategories()
      .pipe(take(1))
      .subscribe({
        next: (cats) => this.categories = cats,
        error: (err) => console.error('Erreur chargement catégories', err)
      });

    // 2. Charger les matériaux
    this.fetchMaterials();
  }

  fetchMaterials(): void {
    this.isLoading = true;
    this.materialService.getMaterials()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          // Tri par ID décroissant (plus récents en premier)
          this.materials = data.sort((a, b) => b.id - a.id);
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Erreur de chargement", err);
          this.error = 'Impossible de charger la liste. Vérifiez votre connexion ou vos droits admin.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Retourne la liste filtrée selon la recherche et la catégorie
   */
  get filteredMaterials(): Material[] {
    return this.materials.filter(material => {
      const nameMatch = material.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const categoryMatch = this.selectedCategoryId 
        ? material.category_id === +this.selectedCategoryId 
        : true;
      return nameMatch && categoryMatch;
    });
  }

  /**
   * Retourne uniquement les 5 éléments de la page actuelle
   */
  get paginatedMaterials(): Material[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMaterials.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcule le nombre total de pages en fonction des filtres actifs
   */
  get totalPages(): number {
    const count = this.filteredMaterials.length;
    return Math.ceil(count / this.itemsPerPage);
  }

  /**
   * Réinitialise la page à 1 quand on change un filtre
   */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  onDeleteMaterial(material: Material): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${material.name}" ?`)) {
      this.materialService.deleteMaterial(material.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.materials = this.materials.filter(m => m.id !== material.id);
            // Ajuster la page si la suppression vide la page actuelle
            if (this.paginatedMaterials.length === 0 && this.currentPage > 1) {
              this.currentPage--;
            }
          },
          error: (err) => {
            alert("Erreur lors de la suppression. Le matériau est peut-être utilisé ailleurs.");
          }
        });
    }
  }

  onEditMaterial(id: number): void {
    this.router.navigate(['/admin/materials/edit', id]);
  }

  onCreateMaterial(): void {
    this.router.navigate(['/admin/materials/create']);
  }
}