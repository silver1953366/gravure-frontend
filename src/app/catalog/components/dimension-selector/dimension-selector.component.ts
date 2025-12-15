import { Component, input, output } from '@angular/core';
import { CommonModule, NgClass, DecimalPipe } from '@angular/common';
import { MaterialDimension } from '../../../core/models/material-dimension.model';

@Component({
  selector: 'app-dimension-selector',
  standalone: true,
  imports: [CommonModule, NgClass, DecimalPipe],
  template: `
    @if (!dimensions().length) {
        <div class="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center font-medium">
            ⚠️ Aucune dimension disponible pour cette combinaison.
        </div>
    }

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        @for (dimension of dimensions(); track dimension.id) {
          <div 
            (click)="selectDimension(dimension)"
            [class.ring-2]="dimension.id === selectedDimension()?.id"
            [class.ring-indigo-500]="dimension.id === selectedDimension()?.id"
            class="p-4 border-2 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md bg-white text-center"
          >
            <h4 class="font-bold text-lg" 
                [ngClass]="{'text-indigo-600': dimension.id === selectedDimension()?.id}">
              {{ dimension.dimension_label }}
            </h4>
            <p class="text-sm text-gray-500 mt-1">
                {{ dimension.unit_price_fcfa | number:'1.2-2' }} FCFA
            </p>
          </div>
        }
    </div>
  `,
})
export class DimensionSelectorComponent {
  dimensions = input<MaterialDimension[]>([]);
  selectedDimension = input<MaterialDimension | null>(null);

  dimensionSelected = output<MaterialDimension | null>();

  selectDimension(dimension: MaterialDimension): void {
    const newSelection = this.selectedDimension()?.id === dimension.id ? null : dimension;
    this.dimensionSelected.emit(newSelection);
  }
}