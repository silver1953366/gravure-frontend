
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container">
      <div class="spinner"></div>
      <p class="loading-text">Chargement...</p>
    </div>
  `,
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {}
