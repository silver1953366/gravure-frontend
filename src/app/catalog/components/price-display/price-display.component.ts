import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './price-display.component.html',
  styleUrls: ['./price-display.component.css']
})
export class PriceDisplayComponent {
  // Le prix réel proviendrait d'un service après calcul
  @Input() price: number = 895.50; 
}