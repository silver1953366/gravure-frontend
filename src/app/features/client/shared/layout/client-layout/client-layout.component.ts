import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Les composants Client Shared que nous aurions définis précédemment
// Note: Ces imports sont basés sur une structure Client-Side standard.
// Si vous aviez une Navbar et Sidebar séparées pour le client, vous les importeriez ici.
// Pour ce layout, nous allons simuler les imports de la sidebar et navbar pour le client.
// Pour le moment, nous allons utiliser de simples divs pour les représenter.

@Component({
  selector: 'app-client-layout',
  standalone: true,
  // Nous utiliserions ici les composants du client comme 'ClientSidebarComponent'
  imports: [CommonModule, RouterModule], 
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css']
})
export class ClientLayoutComponent implements OnInit {

  // La sidebar du client est souvent masquée sur mobile, ou absente si la navigation est par navbar seule.
  // Nous supposons une navigation par sidebar pour la cohérence avec le domaine Controller.
  public isSidebarOpen: boolean = true; 
  private sidebarWidth: number = 256; // Exemple de largeur en pixels (16rem)

  constructor() {
    // Initialisation : la sidebar est ouverte par défaut sur grand écran.
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }

  ngOnInit(): void {}

  /**
   * Bascule l'état d'ouverture de la sidebar.
   */
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}