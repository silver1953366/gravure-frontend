import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dimension-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dimension-selector.component.html',
  styleUrls: ['./dimension-selector.component.css']
})
export class DimensionSelectorComponent {
  length: number | null = null;
  width: number | null = null;
  thickness: number | null = null;

  get isInvalid(): boolean {
    return (this.length !== null && this.length <= 0) || 
           (this.width !== null && this.width <= 0) || 
           (this.thickness !== null && this.thickness <= 0);
  }
}