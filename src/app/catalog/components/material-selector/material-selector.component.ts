import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-material-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-selector.component.html',
  styleUrls: ['./material-selector.component.css']
})
export class MaterialSelectorComponent {
  materials = [
    { id: 1, name: 'Acier Inoxydable (304)' },
    { id: 2, name: 'Aluminium' },
    { id: 3, name: 'Laiton' },
    { id: 4, name: 'Cuivre' },
  ];
  selectedMaterial: number | null = null;
}