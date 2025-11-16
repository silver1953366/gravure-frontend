// src/app/features/admin/pricing/pricing.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PricingService } from './pricing.service';
import { MaterialDimension, Material, Shape, Category } from '../../../core/models/category.model';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  
  // Données de la table
  dimensions: MaterialDimension[] = [];
  materials: Material[] = [];
  shapes: Shape[] = [];
  categories: Category[] = [];

  // État
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Formulaire CRUD
  dimensionForm: FormGroup;
  isEditMode = false;
  currentDimensionId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private pricingService: PricingService
  ) {
    this.dimensionForm = this.fb.group({
      material_id: ['', Validators.required],
      shape_id: ['', Validators.required],
      category_id: ['', Validators.required],
      dimension_label: ['', Validators.required],
      unit_price_fcfa: [0.01, [Validators.required, Validators.min(0.01)]],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadDependenciesAndData();
  }

  /**
   * Charge simultanément les listes déroulantes (dépendances) et les données du catalogue.
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
        this.dimensions = results.dimensions;
        this.materials = results.materials;
        this.shapes = results.shapes;
        this.categories = results.categories;
        this.isLoading = false;
        
        // Initialiser les valeurs du formulaire si elles sont vides
        if (this.materials.length) this.dimensionForm.get('material_id')?.setValue(this.materials[0].id);
        if (this.shapes.length) this.dimensionForm.get('shape_id')?.setValue(this.shapes[0].id);
        if (this.categories.length) this.dimensionForm.get('category_id')?.setValue(this.categories[0].id);
      },
      error: (err: any) => {
        console.error("Erreur lors du chargement des données:", err);
        this.error = 'Impossible de charger les dépendances ou le catalogue. Vérifiez les routes API.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Prépare le formulaire pour l'édition.
   */
  editDimension(dimension: MaterialDimension): void {
    this.isEditMode = true;
    this.currentDimensionId = dimension.id || null;
    this.successMessage = null;
    this.error = null;
    
    // Remplir le formulaire avec les données de la dimension
    this.dimensionForm.patchValue({
      material_id: dimension.material_id,
      shape_id: dimension.shape_id,
      category_id: dimension.category_id,
      dimension_label: dimension.dimension_label,
      unit_price_fcfa: dimension.unit_price_fcfa,
      is_active: dimension.is_active,
    });

    // Optionnel: Empêcher la modification des clés (material/shape/category) en mode édition
    this.dimensionForm.get('material_id')?.disable();
    this.dimensionForm.get('shape_id')?.disable();
    // La category_id peut être modifiée si l'implémentation le permet
  }

  /**
   * Réinitialise le formulaire pour la création.
   */
  resetForm(): void {
    this.isEditMode = false;
    this.currentDimensionId = null;
    this.successMessage = null;
    this.error = null;
    this.dimensionForm.reset({
      material_id: this.materials.length ? this.materials[0].id : '',
      shape_id: this.shapes.length ? this.shapes[0].id : '',
      category_id: this.categories.length ? this.categories[0].id : '',
      unit_price_fcfa: 0.01,
      is_active: true
    });
    this.dimensionForm.get('material_id')?.enable();
    this.dimensionForm.get('shape_id')?.enable();
  }

  /**
   * Gère la soumission du formulaire (création ou mise à jour).
   */
  onSubmit(): void {
    this.isSaving = true;
    this.successMessage = null;
    this.error = null;

    if (this.dimensionForm.invalid) {
      this.dimensionForm.markAllAsTouched();
      this.error = "Veuillez corriger les erreurs de validation.";
      this.isSaving = false;
      return;
    }

    // Récupérer les valeurs, inclure les champs désactivés si en mode édition
    const formValue = this.dimensionForm.getRawValue();

    if (this.isEditMode && this.currentDimensionId) {
      // Mise à jour (PATCH)
      this.pricingService.updateMaterialDimension(this.currentDimensionId, formValue).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = "Entrée de catalogue mise à jour avec succès!";
          this.loadDependenciesAndData(); // Recharger les données
          this.resetForm();
        },
        error: (err: any) => this.handleError(err, 'mise à jour')
      });
    } else {
      // Création (POST)
      this.pricingService.createMaterialDimension(formValue).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = "Nouvelle entrée de catalogue créée avec succès!";
          this.loadDependenciesAndData();
          this.resetForm();
        },
        error: (err: any) => this.handleError(err, 'création')
      });
    }
  }
  
  /**
   * Gère la suppression d'une entrée.
   */
  deleteDimension(id: number | undefined): void {
    if (!id || !confirm("Êtes-vous sûr de vouloir supprimer cette entrée du catalogue ? Elle doit être retirée de l'inventaire et des devis existants.")) {
      return;
    }

    this.pricingService.deleteMaterialDimension(id).subscribe({
      next: () => {
        this.successMessage = "Entrée du catalogue supprimée avec succès.";
        this.loadDependenciesAndData();
      },
      error: (err: any) => {
        console.error("Erreur de suppression:", err);
        // Gère les conflits (409) si l'entrée est utilisée dans l'inventaire/devis (selon le backend PHP)
        if (err.status === 409) {
          this.error = err.error.message || 'Conflit: Impossible de supprimer cette entrée (utilisée dans l\'inventaire/devis).';
        } else {
          this.error = 'Erreur lors de la suppression de l\'entrée.';
        }
      }
    });
  }

  /**
   * Gestion centralisée des erreurs API.
   */
  private handleError(err: any, operation: string): void {
    this.isSaving = false;
    console.error(`Erreur de ${operation}:`, err);

    if (err.status === 422 && err.error && err.error.errors) {
      // Erreur de validation Laravel
      const apiErrors = err.error.errors;
      let errorMsg = `Erreur de validation lors de la ${operation}:<br>`;
      for (const key in apiErrors) {
        if (apiErrors.hasOwnProperty(key)) {
          errorMsg += `- ${apiErrors[key].join(' ')}<br>`;
        }
      }
      this.error = errorMsg;
    } else {
      this.error = `Une erreur est survenue lors de la ${operation} : ${err.message || err.statusText}`;
    }
  }
}