import { Component, OnInit, signal, inject, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { ShapeService } from '../../../core/services/catalog/shape.service'; // Service n'est plus nécessaire ici
import { Shape } from '../../../core/models/shape.model';

@Component({
  selector: 'app-shape-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">
        Choisir la Forme de découpe
      </h3>
      
            @if (!shapes().length) {
        <p class="text-center text-orange-600 py-4">
            {{ isLoading() ? 'Chargement des formes...' : 'Aucune forme disponible.' }}
        </p>
      }

      <div class="flex flex-wrap gap-4 justify-center">
        @for (shape of shapes(); track shape.id) {
          <div 
            (click)="selectShape(shape)"
            [class.ring-2]="shape.id === selectedShape()?.id"
            [class.ring-indigo-500]="shape.id === selectedShape()?.id"
            class="w-32 h-32 p-2 border-2 rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col items-center justify-center 
                   transition-all duration-300 transform hover:scale-[1.05] hover:shadow-lg bg-white"
          >
            @if (shape.image_url) {
              <img [src]="shape.image_url" [alt]="shape.name" class="h-16 w-16 object-contain mb-2"/>
            } @else {
              <div class="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-lg mb-2">
                <span class="text-gray-500 font-bold text-lg">{{ shape.name.charAt(0) }}</span>
              </div>
            }

            <h4 class="text-sm font-semibold text-center mt-auto" 
                [ngClass]="{'text-indigo-600': shape.id === selectedShape()?.id}">
              {{ shape.name }}
            </h4>
          </div>
        }
      </div>
    </div>
  `,
})
// L'implémentation de OnInit n'est plus nécessaire car le chargement est externe
export class ShapeSelectorComponent { 
  
  // --- CORRECTION MAJEURE: Ajout de l'Input manquant (Résout NG8002) ---
  shapes = input<Shape[]>([]); 
  
  // Signal factice pour le loading, si besoin, sinon retirer
  isLoading = input<boolean>(false);

  selectedShape = signal<Shape | null>(null);
  
  // Correction du type d'Output pour inclure null (désélection)
  shapeSelected = output<Shape | null>(); 

  // --- Logique retirée : ShapeService, allShapes, activeShapes, ngOnInit, fetchShapes

  // --- Logique de sélection ---

  selectShape(shape: Shape): void {
    // Si l'utilisateur clique sur la forme déjà sélectionnée, la désélectionner (toggle)
    const newSelection = this.selectedShape()?.id === shape.id ? null : shape;

    this.selectedShape.set(newSelection);
    this.shapeSelected.emit(newSelection); // Émettre l'événement au parent
  }
}