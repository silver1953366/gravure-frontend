import { Component, input, output } from '@angular/core';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Material } from './../../../core/models/material.model';

@Component({
 selector: 'app-material-selector',
 standalone: true,
 imports: [CommonModule, NgClass, NgStyle],
 template: `
    @if (!materials().length && !isLoading()) {
        <p class="text-center text-gray-500 py-4">Aucun matériau disponible.</p>
    }
    @if (isLoading()) {
        <p class="text-center text-gray-500 py-4">Chargement des matériaux...</p>
    }

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    @for (material of materials(); track material.id) {
     <div 
      (click)="selectMaterial(material)"
      [class.ring-2]="material.id === selectedMaterial()?.id"
      [class.ring-indigo-500]="material.id === selectedMaterial()?.id"
     [ngStyle]="{'border-color': material.color ? material.color : '#e5e7eb'}"
     class="relative border-2 rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg bg-white"
    >
                <!-- Bandeau de couleur/image -->
                <div 
                    [ngStyle]="{'background-color': material.color ? material.color : '#4f46e5'}"
                    class="h-16 flex items-center justify-center text-white font-bold text-lg p-2"
                >
                    @if (material.image_url) {
                        <img [src]="material.image_url" [alt]="material.name" class="h-full w-full object-cover"/>
                    } @else {
                        {{ material.name }}
                    }
                </div>

                <div class="p-3">
                    <!-- Nom du matériau -->
                    <h4 class="text-base font-semibold text-gray-800 truncate" 
                        [ngClass]="{'text-indigo-600': material.id === selectedMaterial()?.id}">
                        {{ material.name }}
                    </h4>
                    <!-- Description du matériau -->
                    @if (material.description) {
                        <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ material.description }}</p>
                    }
                </div>
                
                <!-- Icône de sélection -->
                @if (material.id === selectedMaterial()?.id) {
                    <div class="absolute top-2 right-2 text-indigo-500 bg-white rounded-full p-0.5 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                }
     </div>
    }
  </div>
 `,
})
export class MaterialSelectorComponent {
 materials = input<Material[]>([]); 
 selectedMaterial = input<Material | null>(null); 
 isLoading = input<boolean>(false); 

 materialSelected = output<Material | null>(); 

 selectMaterial(material: Material): void {
  const newSelection = this.selectedMaterial()?.id === material.id ? null : material;
  this.materialSelected.emit(newSelection); 
 }
}