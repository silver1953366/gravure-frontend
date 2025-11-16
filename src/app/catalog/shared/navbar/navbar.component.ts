import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  // 🚨 CORRECTION : Utilisation du fichier de template séparé 🚨
  templateUrl: './navbar.component.html', 
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  /**
   * Émet un événement pour que le composant parent (CatalogListComponent) puisse gérer l'ouverture/fermeture de la Sidebar.
   */
  toggleSidebar = output<void>();
}