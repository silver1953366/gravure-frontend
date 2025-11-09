import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  
  // Émet un événement pour informer le composant parent (App/Layout) de basculer la sidebar
  @Output() toggleSidebar = new EventEmitter<void>();

  isDarkMode: boolean = false;
  
  // Liste des liens de navigation (à terme, elle serait injectée via un service)
  mainNavLinks = [
    { path: '/catalog', label: 'Catalogue' }, // Route publique (corrigée par rapport à votre route client)
    { path: '/configurator', label: 'Personnalisation' }, // Route publique (corrigée)
    { path: '/preview', label: 'Aperçu' }, // Route publique (corrigée)
    { path: '/client/quotes', label: 'Devis' }, // Route client
  ];

  ngOnInit(): void {
    // Initialise l'état du mode sombre en fonction de l'état actuel du DOM
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  /**
   * Bascule le mode sombre et met à jour la classe CSS sur l'élément <html>.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * Émet l'événement pour basculer la barre latérale.
   */
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}