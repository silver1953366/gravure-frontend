import { Component, OnInit, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators'; 

// Imports des composants enfants
import { MaterialSelectorComponent } from './../../components/material-selector/material-selector.component';
import { ShapeSelectorComponent } from './../../components/shape-selector/shape-selector.component';
import { DimensionSelectorComponent } from './../../components/dimension-selector/dimension-selector.component';

// Imports des modèles et services
import { Material } from './../../../core/models/material.model';
import { Shape } from './../../../core/models/shape.model';
import { MaterialDimension } from './../../../core/models/material-dimension.model';
import { CatalogService } from './../../../core/services/catalog/catalog.service'; 

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    DecimalPipe,
    MaterialSelectorComponent,
    ShapeSelectorComponent,
    DimensionSelectorComponent,
  ],
  templateUrl: './configurator.component.html', 
  styleUrl: './configurator.component.css', 
})
export class ConfiguratorComponent implements OnInit, OnDestroy {
  
  private catalogService = inject(CatalogService);
  private subscription = new Subscription();

  // --- ÉTAT GLOBAL DE LA CONFIGURATION (Signals) ---
  selectedMaterial = signal<Material | null>(null);
  selectedShape = signal<Shape | null>(null);
  selectedDimension = signal<MaterialDimension | null>(null);
  quantity = signal<number>(1);
  engravingText = signal<string>(''); 
  mountingOption = signal<string>('none'); // Fixe l'erreur 'mountingOption'
  
  // --- DONNÉES DISPONIBLES & ÉTAT DE CHARGEMENT ---
  availableMaterials = signal<Material[]>([]);
  availableShapes = signal<Shape[]>([]);
  availableDimensions = signal<MaterialDimension[]>([]);
  isLoadingMaterials = signal<boolean>(false);
  isLoadingShapes = signal<boolean>(false);

  // --- GESTION DES ÉTAPES ---
  currentStep = signal<number>(1); 

  // --- CALCULS (COMPUTED) ---
  
  engravingCost = computed<number>(() => {
    // Logique de coût de gravure (simulée ici à 2000 FCFA si texte présent)
    return this.engravingText().trim().length > 0 ? 2000 : 0;
  });

  simulatedStyles = computed(() => {
    return {
      width: '150px',
      height: '75px',
      borderRadius: '0px'
    };
  });
  
  totalPrice = computed<number>(() => {
    const dim = this.selectedDimension();
    const qty = this.quantity();
    const engraving = this.engravingCost();
    
    if (!dim) return 0;
    // (Prix unitaire du produit + Coût de la gravure) * Quantité
    return ((dim.unit_price_fcfa || 0) + engraving) * qty; 
  });

  // --- LIFECYCLE & CHARGEMENT DES DONNÉES STATIQUES ---
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // 🚨 CORRECTION CRITIQUE : Ajout de la gestion des erreurs pour débloquer l'état de chargement 🚨
  loadData(): void {
    this.isLoadingMaterials.set(true);
    this.isLoadingShapes.set(true);

    // 1. Charger les matériaux
    this.subscription.add(
        this.catalogService.getAllMaterials().subscribe({
            next: (materials: Material[]) => {
                this.availableMaterials.set(materials);
                this.isLoadingMaterials.set(false);
            },
            error: (error) => {
                console.error("❌ Erreur de chargement des matériaux. Vérifiez l'API/CORS.", error);
                this.availableMaterials.set([]);
                this.isLoadingMaterials.set(false);
            }
        })
    );

    // 2. Charger les formes
    this.subscription.add(
        this.catalogService.getAllShapes().subscribe({
            next: (shapes: Shape[]) => {
                this.availableShapes.set(shapes);
                this.isLoadingShapes.set(false);
            },
            error: (error) => {
                console.error("❌ Erreur de chargement des formes.", error);
                this.availableShapes.set([]);
                this.isLoadingShapes.set(false);
            }
        })
    );
  }
  
  // --- LOGIQUE DE CHARGEMENT DES DIMENSIONS ---
  loadDimensionsForSelection(): void {
    const material = this.selectedMaterial();
    const shape = this.selectedShape();
    
    if (material?.id && shape?.id) {
        this.subscription.add(
            this.catalogService.getDimensions(material.id, shape.id)
                .pipe(
                    catchError((error) => {
                        console.error("[FRONT] Erreur ou aucune dimension trouvée:", error);
                        this.availableDimensions.set([]);
                        this.selectedDimension.set(null);
                        return EMPTY;
                    })
                )
                .subscribe((dims: MaterialDimension[]) => {
                    this.availableDimensions.set(dims);
                    this.selectedDimension.set(null); 
                })
        );
    } else {
        this.availableDimensions.set([]);
        this.selectedDimension.set(null);
    }
  }

  // --- GESTION DES ÉVÉNEMENTS & NAVIGATION ---
    
  onMaterialSelect(material: Material | null): void {
    this.selectedMaterial.set(material);
    this.selectedShape.set(null); 
    this.selectedDimension.set(null); 
    this.availableDimensions.set([]); 
    this.selectStep(material ? 2 : 1); 
  }

  onShapeSelect(shape: Shape | null): void {
    this.selectedShape.set(shape);
    this.selectedDimension.set(null); 
    
    if (shape && this.selectedMaterial()) {
        this.loadDimensionsForSelection();
    } else {
        this.availableDimensions.set([]);
    }
    
    this.selectStep(shape ? 3 : 2);
  }
  
  onDimensionSelect(dimension: MaterialDimension | null): void {
    this.selectedDimension.set(dimension);
    this.selectStep(dimension ? 4 : 3);
  }

  onEngravingTextChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.engravingText.set(input.value);
  }
  
  updateQuantity(delta: number): void {
    this.quantity.update(qty => Math.max(1, qty + delta));
  }
  
  onAddToCart(): void { 
    console.log("Ajout au panier simulé.");
  }
  
  selectStep(step: number): void {
    this.currentStep.set(step);
  }
  
  goBack(): void {
    this.currentStep.update(current => Math.max(1, current - 1));
  }
}