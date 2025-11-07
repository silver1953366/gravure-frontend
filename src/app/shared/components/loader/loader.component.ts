import { Component, Input } from '@angular/core'; // Importez Input ici
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {

  // Propriété INPUT corrigée
  // Déclarer la propriété 'text' et lui donner une valeur par défaut
  @Input() text: string = 'Chargement des données en cours...';

  // S'il y a d'autres propriétés ou le constructeur, elles vont ici
  constructor() {}
}