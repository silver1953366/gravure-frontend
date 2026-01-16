import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PricingService } from './pricing.service';
import { MaterialDimension, Material, Shape, Category } from '../../../core/models/category.model';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  
  // --- Injections ---
  private fb = inject(FormBuilder);
  private pricingService = inject(PricingService);

  // --- Données du catalogue ---
  dimensions: MaterialDimension[] = [];
  materials: Material[] = [];
  shapes: Shape[] = [];
  categories: Category[] = [];

  // --- État UI ---
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  // --- Recherche et Filtres ---
  searchTerm: string = '';
  // Optionnel: vous pouvez ajouter des propriétés pour des sélecteurs de filtres précis
  // filterMaterialId: string = '';

  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // --- Formulaire CRUD ---
  dimensionForm: FormGroup;
  isEditMode = false;
  currentDimensionId: number | null = null;

  constructor() {
    this.dimensionForm = this.fb.group({
      material_id: ['', Validators.required],
      shape_id: ['', Validators.required],
      category_id: ['', Validators.required],
      dimension_label: ['', [Validators.required, Validators.maxLength(100)]],
      unit_price_fcfa: [0, [Validators.required, Validators.min(1)]],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadDependenciesAndData();
  }

  /**
   * Charge simultanément les dépendances et les tarifs
   */
  loadDependenciesAndData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      dimensions: this.pricingService.getMaterialDimensions(),
      materials: this.pricingService.getMaterials(),
      shapes: this.pricingService.getShapes(),
      categories: this.pricingService.getCategories(),
    }).subscribe({
      next: (results) => {
        // Tri par ID décroissant pour voir les nouveautés en premier
        this.dimensions = results.dimensions.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.materials = results.materials;
        this.shapes = results.shapes;
        this.categories = results.categories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur API:", err);
        this.error = 'Erreur lors du chargement des données. Vérifiez votre connexion.';
        this.isLoading = false;
      }
    });
  }

  // --- Logique de Filtrage et Recherche ---

  /**
   * Retourne la liste filtrée selon le terme de recherche global
   * Cherche dans le label, le nom du matériau, de la forme et de la catégorie
   */
  get filteredDimensions(): MaterialDimension[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.dimensions;

    return this.dimensions.filter(dim => {
      const matchLabel = dim.dimension_label?.toLowerCase().includes(term);
      const matchMaterial = dim.material?.name.toLowerCase().includes(term);
      const matchShape = dim.shape?.name.toLowerCase().includes(term);
      const matchCategory = dim.category?.name.toLowerCase().includes(term);
      
      return matchLabel || matchMaterial || matchShape || matchCategory;
    });
  }

  /**
   * Liste finale à afficher après filtrage ET pagination
   */
  get paginatedDimensions(): MaterialDimension[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDimensions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDimensions.length / this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset la page quand on cherche
  }

  // --- Actions Formulaire ---

  onSubmit(): void {
    if (this.dimensionForm.invalid) {
      this.dimensionForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;
    const formValue = this.dimensionForm.getRawValue();

    const request = (this.isEditMode && this.currentDimensionId)
      ? this.pricingService.updateMaterialDimension(this.currentDimensionId, formValue)
      : this.pricingService.createMaterialDimension(formValue);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = this.isEditMode ? "Mise à jour réussie !" : "Ajout réussi !";
        this.resetForm();
        this.loadDependenciesAndData();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => this.handleError(err, this.isEditMode ? 'mise à jour' : 'création')
    });
  }

  editDimension(dimension: MaterialDimension): void {
    this.isEditMode = true;
    this.currentDimensionId = dimension.id || null;
    this.successMessage = null;
    this.error = null;
    
    this.dimensionForm.patchValue({
      material_id: dimension.material_id,
      shape_id: dimension.shape_id,
      category_id: dimension.category_id,
      dimension_label: dimension.dimension_label,
      unit_price_fcfa: dimension.unit_price_fcfa,
      is_active: dimension.is_active,
    });

    this.dimensionForm.get('material_id')?.disable();
    this.dimensionForm.get('shape_id')?.disable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentDimensionId = null;
    this.dimensionForm.reset({
      unit_price_fcfa: 0,
      is_active: true
    });
    this.dimensionForm.get('material_id')?.enable();
    this.dimensionForm.get('shape_id')?.enable();
  }

  deleteDimension(id: number | undefined): void {
    if (!id || !confirm("Supprimer cette entrée ? Cela peut affecter vos devis existants.")) return;

    this.pricingService.deleteMaterialDimension(id).subscribe({
      next: () => {
        this.successMessage = "Supprimé avec succès.";
        this.loadDependenciesAndData();
      },
      error: (err) => {
        this.error = err.status === 409 ? "Conflit : ce tarif est utilisé ailleurs." : "Erreur de suppression.";
      }
    });
  }

  private handleError(err: any, op: string): void {
    this.isSaving = false;
    if (err.status === 422 && err.error?.errors) {
      this.error = "Données invalides : cette combinaison existe peut-être déjà.";
    } else {
      this.error = `Erreur lors de la ${op}.`;
    }
  }
}