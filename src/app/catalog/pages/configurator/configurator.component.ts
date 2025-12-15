// src/app/pages/configurator/configurator.component.ts

import { Component, OnInit, signal, computed, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Subscription, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators'; 

// Imports des composants enfants
import { MaterialSelectorComponent } from './../../components/material-selector/material-selector.component';
import { ShapeSelectorComponent } from './../../components/shape-selector/shape-selector.component';
import { DimensionSelectorComponent } from './../../components/dimension-selector/dimension-selector.component';
import { PreviewComponent } from '../../pages/preview/preview.component'; 
import { PriceDisplayComponent } from '../../components/price-display/price-display.component'; 

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
  mountingOption = signal<string>('none'); 
  
  // Pont pour ngModel
  get mountingOptionModel(): string {
    return this.mountingOption();
  }

  set mountingOptionModel(value: string) {
    this.mountingOption.set(value);
  }
  
  // --- DONNÉES DISPONIBLES & ÉTAT DE CHARGEMENT ---
  availableMaterials = signal<Material[]>([]);
  availableShapes = signal<Shape[]>([]);
  availableDimensions = signal<MaterialDimension[]>([]); 
  isLoadingMaterials = signal<boolean>(false);
  isLoadingShapes = signal<boolean>(false);

  // --- GESTION DES ÉTAPES ---
  currentStep = signal<number>(1); 

    constructor() {
        // Utilisation de l'effect pour déclencher le chargement des dimensions
        // s'il y a un Matériau ET une Forme de sélectionnés.
        effect(() => {
            const material = this.selectedMaterial();
            const shape = this.selectedShape();
            
            if (material && shape) {
                this.loadDimensionsForSelection();
            } else {
                this.availableDimensions.set([]);
                this.selectedDimension.set(null);
            }
        });
    }
  
  // --- CALCULS (COMPUTED) ---
  
  engravingCost = computed<number>(() => {
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
    return ((dim.unit_price_fcfa || 0) + engraving) * qty; 
  });

  // --- LIFECYCLE & CHARGEMENT DES DONNÉES STATIQUES ---
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

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
                console.error("❌ Erreur de chargement des matériaux.", error);
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
            // L'appel utilise le CatalogService, qui a été corrigé pour appeler /catalog/dimensions
            this.catalogService.getDimensions(material.id, shape.id)
                .pipe(
                    catchError((error) => {
                        // Ce log s'affiche si le Back-end renvoie 404, 500, ou erreur réseau
                        console.error("[FRONT] Erreur lors de la récupération des dimensions:", error);
                        this.availableDimensions.set([]);
                        this.selectedDimension.set(null);
                        return EMPTY;
                    })
                )
                .subscribe((dims: MaterialDimension[]) => {
                    // Ce code s'exécute si l'appel réussit (même si dims est vide)
                    this.availableDimensions.set(dims);
                    this.selectedDimension.set(null); 
                })
        );
    }
  }

  // --- GESTION DES ÉVÉNEMENTS & NAVIGATION ---
    
  onMaterialSelect(material: Material | null): void {
    this.selectedMaterial.set(material);
    this.selectedShape.set(null); // Réinitialise la forme
    this.selectedDimension.set(null); 
    // L'effect se charge de vider availableDimensions si shape est null.
    this.selectStep(material ? 2 : 1); 
  }

  onShapeSelect(shape: Shape | null): void {
    this.selectedShape.set(shape);
    this.selectedDimension.set(null); 
    // L'effect déclenche loadDimensionsForSelection si material est déjà sélectionné.
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
    console.log("Ajout au panier simulé pour le total:", this.totalPrice());
    // TODO: Intégrer la logique réelle d'ajout au panier/devis
  }
  
  selectStep(step: number): void {
    this.currentStep.set(step);
  }
  
  goBack(): void {
    this.currentStep.update(current => Math.max(1, current - 1));
  }
}