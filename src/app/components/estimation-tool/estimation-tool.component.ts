import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { EstimationService } from '../../services/estimation.service';
import { Category, Material, Shape, EstimationResult, EstimationRequest } from '../../models/catalog.model';
import { switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-estimation-tool',
  // IMPORTANT: Ajout des modules pour les formulaires réactifs et les directives Angular
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estimation-tool.component.html',
  styleUrls: ['./estimation-tool.component.css']
})
export class EstimationToolComponent implements OnInit {

  // --- Injection des Services ---
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private estimationService = inject(EstimationService);

  // --- Propriétés de l'État (via Signals pour une meilleure performance) ---
  
  // Données du catalogue
  categories = signal<Category[]>([]);
  materials = signal<Material[]>([]);
  shapes = signal<Shape[]>([]);

  // État du formulaire
  estimationForm!: FormGroup;
  selectedFile: File | null = null;

  // Résultat de l'estimation
  estimationResult = signal<EstimationResult | null>(null);
  
  // Indicateurs d'état
  isLoading = signal(true);
  isCalculating = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // --- Propriétés Calculées (Computed Signals) ---

  // Matériaux filtrés basés sur la catégorie sélectionnée dans le formulaire
  filteredMaterials = computed(() => {
    const selectedCategoryId = this.estimationForm?.get('category_id')?.value;
    if (!selectedCategoryId) {
      // Retourne tous les matériaux si aucune catégorie n'est sélectionnée (ou le formulaire n'est pas prêt)
      return this.materials();
    }
    // Filtre les matériaux pour n'afficher que ceux de la catégorie sélectionnée
    return this.materials().filter(m => m.category_id == selectedCategoryId);
  });

  // --- Cycle de Vie et Initialisation ---

  ngOnInit(): void {
    // 1. Initialiser le formulaire AVANT le chargement des données
    this.initForm();
    
    // 2. Charger les données du catalogue
    this.loadCatalogData();
    
    // 3. Écouter les changements des champs critiques (pour vider le résultat si l'entrée change)
    this.setupFormListeners();
  }
  
  /**
   * Initialise le formulaire réactif avec les validations.
   */
  initForm(): void {
    this.estimationForm = this.fb.group({
      category_id: [null, Validators.required], // Utilisé pour filtrer, non envoyé à l'API
      material_id: [null, Validators.required],
      shape_id: [null, Validators.required],
      width: [50, [Validators.required, Validators.min(10)]], // Min 10mm
      height: [50, [Validators.required, Validators.min(10)]], // Min 10mm
      quantity: [1, [Validators.required, Validators.min(1)]],
      thickness: [3, [Validators.required, Validators.min(1)]], // Exemple d'épaisseur par défaut
      file: [null] // Pour la référence du fichier
    });
  }

  /**
   * Configure les écouteurs pour réinitialiser l'estimation si les paramètres changent.
   */
  setupFormListeners(): void {
    // Écoute les changements sur la catégorie pour réinitialiser le material_id
    this.estimationForm.get('category_id')?.valueChanges.subscribe(categoryId => {
        // Optionnel: Réinitialiser le matériau sélectionné si la catégorie change
        this.estimationForm.get('material_id')?.setValue(null, { emitEvent: false });
        this.resetEstimation();
    });

    // Écoute des changements sur les champs de calculs pour réinitialiser l'estimation
    ['material_id', 'shape_id', 'width', 'height', 'quantity', 'thickness'].forEach(controlName => {
      this.estimationForm.get(controlName)?.valueChanges.subscribe(() => {
        this.resetEstimation();
      });
    });
  }
  
  /**
   * Récupère toutes les données nécessaires du catalogue.
   */
  loadCatalogData(): void {
    this.isLoading.set(true);
    this.catalogService.getCategories().pipe(
      // Une fois les catégories chargées, on charge les matériaux
      switchMap(categories => {
        this.categories.set(categories);
        return this.catalogService.getMaterials();
      }),
      // Une fois les matériaux chargés, on charge les formes
      switchMap(materials => {
        this.materials.set(materials);
        return this.catalogService.getShapes();
      }),
      catchError(error => {
        console.error('Erreur de chargement du catalogue:', error);
        this.errorMessage.set('Erreur lors du chargement des données du catalogue.');
        return of([]);
      })
    ).subscribe({
      next: (shapes) => {
        this.shapes.set(shapes as Shape[]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  /**
   * Gère la sélection de fichier par l'utilisateur.
   * @param event L'événement de changement de l'input de type 'file'.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.resetEstimation();
    } else {
      this.selectedFile = null;
    }
  }

  /**
   * Soumet le formulaire pour obtenir une estimation.
   */
  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    
    // 1. Vérification du formulaire
    if (this.estimationForm.invalid) {
      this.estimationForm.markAllAsTouched();
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    this.isCalculating.set(true);

    // 2. Construction de l'objet de requête (basé sur l'interface EstimationRequest)
    const formValue = this.estimationForm.value;
    const request: EstimationRequest = {
      material_id: formValue.material_id,
      shape_id: formValue.shape_id,
      width: formValue.width,
      height: formValue.height,
      quantity: formValue.quantity,
      thickness: formValue.thickness,
      file: this.selectedFile // Ajoute le fichier sélectionné
    };
    
    // 3. Appel au service d'estimation
    this.estimationService.calculateEstimate(request).subscribe({
      next: (result) => {
        this.estimationResult.set(result);
        this.isCalculating.set(false);
        this.successMessage.set('Calcul effectué avec succès.');
        // Note : Le résultat peut être mis en cache ou affiché directement
      },
      error: (err) => {
        console.error('Erreur d\'estimation:', err);
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue lors du calcul de l\'estimation.');
        this.isCalculating.set(false);
        this.estimationResult.set(null);
      }
    });
  }
  
  /**
   * Réinitialise les messages et le résultat de l'estimation.
   */
  resetEstimation(): void {
    this.estimationResult.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  /**
   * Aide à la validation des champs dans le template.
   * @param controlName Le nom du champ.
   * @returns Vrai si le champ est invalide et touché/modifié.
   */
  isInvalid(controlName: string): boolean | undefined {
    const control = this.estimationForm.get(controlName);
    return control?.invalid && (control?.dirty || control?.touched);
  }
}
