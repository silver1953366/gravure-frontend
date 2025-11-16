import { Component, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Nécessaire pour [(ngModel)]
// Importation propre depuis l'index du dossier catalog/
import { Material } from '../../../core/models/material.model';
import { Shape } from '../../../core/models/shape.model';
import { MaterialDimension } from '../../../core/models/material-dimension.model'; 
// ------------------------------

@Component({
  selector: 'app-dimension-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>
        Choisir la Dimension
      </h3>

      @if (dimensions().length > 0) {
        <select 
          [(ngModel)]="selectedDimension"
          (ngModelChange)="onDimensionChange($event)"
          class="block w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
        >
          <option [ngValue]="null" disabled>-- Sélectionnez une dimension --</option>
          @for (dimension of dimensions(); track dimension.id) {
            <option [ngValue]="dimension" class="p-2">
              {{ dimension.dimension_label }} ({{ dimension.unit_price_fcfa | number:'1.2-2' }} FCFA)
            </option>
          }
        </select>
        
      } @else if (material() && shape()) {
        <div class="p-4 text-center bg-yellow-50 rounded-lg text-yellow-800 border border-yellow-200">
          <p class="font-medium">Aucune dimension disponible pour cette combinaison Matériau/Forme.</p>
        </div>
      } @else {
        <div class="p-4 text-center bg-gray-50 rounded-lg text-gray-500">
          <p>Veuillez d'abord sélectionner un **Matériau** et une **Forme**.</p>
        </div>
      }
    </div>
  `,
})
export class DimensionSelectorComponent {
  // Inputs
  material = input<Material | null>(null);
  shape = input<Shape | null>(null);
  dimensions = input<MaterialDimension[]>([]);

  // Internal state
  selectedDimension: MaterialDimension | null = null;
  
  // Output
  dimensionSelected = output<MaterialDimension | null>();

  /**
   * Émet l'événement lorsque la sélection de la dimension change.
   * @param dimension La nouvelle MaterialDimension sélectionnée.
   */
  onDimensionChange(dimension: MaterialDimension | null): void {
    this.dimensionSelected.emit(dimension);
  }
}