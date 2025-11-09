import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog-list.component.html',
  styleUrls: ['./catalog-list.component.css']
})
export class CatalogListComponent {
  // Liste simulée pour le rendu
  products = [1, 2, 3, 4, 5, 6];
}