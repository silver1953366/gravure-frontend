import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // Seul RouterOutlet et CommonModule sont nécessaires pour que le routeur fonctionne
  imports: [CommonModule, RouterModule, RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Application E.M.E.S Gravure';
  // Plus de isSidebarOpen, toggleSidebar, ou closeSidebar ici
}