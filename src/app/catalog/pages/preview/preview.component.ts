// src/app/catalog/pages/preview/preview.component.ts:
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialDimension } from '../../../core/models/material-dimension.model'; 
// Imports non utilisés retirés (Shape, Material)

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white border-2 border-dashed border-indigo-200 rounded-xl shadow-lg">
      <h3 class="text-2xl font-bold text-indigo-800 mb-4">
        Aperçu du Produit
      </h3>

      @if (selectedDimension()) {
        <div class="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300">
          
          @if (selectedDimension()?.material?.image_url) {
            <img 
              [src]="selectedDimension()?.material?.image_url" 
              alt="Texture du matériau" 
              class="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          } @else {
            <div class="absolute inset-0 w-full h-full bg-gray-300 flex items-center justify-center text-white font-bold">MATÉRIAU</div>
          }

          @if (selectedDimension()?.shape?.image_url) {
                        <img 
              [src]="selectedDimension()?.shape?.image_url" 
              alt="Forme sélectionnée" 
              class="relative max-w-2/3 max-h-2/3 object-contain z-10 
                     p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl"
              style="border: 4px solid white;"
            />
          } @else {
            <div class="text-center p-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl z-10">
              <p class="font-semibold text-gray-700">Aperçu de la forme non disponible.</p>
            </div>
          }
          
        </div>

        <div class="mt-4 p-3 bg-indigo-50 border border-indigo-300 rounded text-center">
            <p class="font-bold text-lg text-indigo-700">Dimension :</p>
            <p class="text-xl font-extrabold text-indigo-900">{{ selectedDimension()?.dimension_label }}</p>
        </div>

      } @else {
        <div class="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p class="text-center p-4">Sélectionnez un **Matériau**, une **Forme** et une **Dimension** pour voir l'aperçu.</p>
        </div>
      }
    </div>
  `,
})
export class PreviewComponent {
  
  selectedDimension = input<MaterialDimension | null>(null);
  
  // CORRECTION : Ajout de l'input manquant, qui était la cause de l'erreur NG8002
  simulatedStyles = input<any>({}); 
  
}