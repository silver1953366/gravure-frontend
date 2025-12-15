// src/app/catalog/components/shape-selector/shape-selector.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Shape } from '../../../core/models/shape.model';

@Component({
 selector: 'app-shape-selector',
 standalone: true,
 imports: [CommonModule, NgClass],
 template: `
    @if (!shapes().length && !isLoading()) {
        <p class="text-center text-gray-500 py-4">Aucune forme disponible.</p>
    }
    @if (isLoading()) {
        <p class="text-center text-gray-500 py-4">Chargement des formes...</p>
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
 `,
})
export class ShapeSelectorComponent { 
 shapes = input<Shape[]>([]); 
 selectedShape = input<Shape | null>(null); 
 isLoading = input<boolean>(false); 

 shapeSelected = output<Shape | null>(); 

 selectShape(shape: Shape): void {
  const newSelection = this.selectedShape()?.id === shape.id ? null : shape;
  this.shapeSelected.emit(newSelection); 
 }
}