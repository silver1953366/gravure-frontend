// src/app/catalog/components/price-display/price-display.component.ts
import { Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MaterialDimension } from '../../../core/models/material-dimension.model'; 

@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [CommonModule, DecimalPipe], 
  template: `
    <div class="p-6 bg-white border-4 border-dashed border-gray-300 rounded-xl shadow-inner">
      <h3 class="text-2xl font-extrabold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.348-.204.555-.303 1.05-.503 2.13-.854 3.32-.854.195 0 .34.02.474.053a.5.5 0 01.373.548l-.94 9.177a.5.5 0 01-.465.413H11.75a.5.5 0 01-.465-.413l-.94-9.177a.5.5 0 01.373-.548c.134-.034.28-.053.474-.053h.364c.29 0 .576.088.831.246.12.073.238.16.353.255a.65.65 0 00.373-.243 1.05 1.05 0 00.088-1.077 3.5 3.5 0 00-.776-1.096c-.464-.384-.96-.653-1.472-.82a.5.5 0 00-.603.208.5.5 0 00.207.603c.512.167 1.008.436 1.472.82.464.384.776.848.776 1.348 0 .42-.162.78-.444 1.066z" />
        </svg>
        Détails & Prix
      </h3>
      
      @if (selectedDimension()) {
        <div class="space-y-3">
          <div class="p-3 bg-indigo-50 border border-indigo-300 rounded-lg text-center">
            <p class="text-lg text-indigo-700">Prix Unitaire Hors Taxe</p>
            <p class="text-4xl font-extrabold text-indigo-900 mt-1">
              {{ selectedDimension()?.unit_price_fcfa | number:'1.2-2' }} FCFA
            </p>
          </div>
          
          <div class="text-gray-600 border-t pt-3 space-y-2">
            <p><span class="font-medium text-gray-800">Matériau:</span> {{ selectedDimension()?.material?.name }}</p>
            <p><span class="font-medium text-gray-800">Forme:</span> {{ selectedDimension()?.shape?.name }}</p>
            <p><span class="font-medium text-gray-800">Dimension:</span> {{ selectedDimension()?.dimension_label }}</p>
            </div>

        </div>
      } @else {
        <div class="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
          <p class="font-medium">Veuillez sélectionner un **Matériau**, une **Forme** et une **Dimension**.</p>
        </div>
      }
    </div>
  `,
})
export class PriceDisplayComponent {
  // Le composant reçoit l'objet MaterialDimension complet en entrée
  selectedDimension = input<MaterialDimension | null>(null);
}