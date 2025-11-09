import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shape-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shape-selector.component.html',
  styleUrls: ['./shape-selector.component.css']
})
export class ShapeSelectorComponent {
  shapes = [
    { name: 'Rectangle', icon: 'fas fa-square' },
    { name: 'Cercle', icon: 'fas fa-circle' },
    { name: 'Tube', icon: 'fas fa-grip-lines' },
    { name: 'Personnalisé', icon: 'fas fa-pen-nib' },
  ];
  selectedShape: string = 'Rectangle';

  selectShape(shape: any) {
    this.selectedShape = shape.name;
  }
}