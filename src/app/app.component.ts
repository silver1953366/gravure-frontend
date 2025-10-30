import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Assurez-vous que LandingComponent n'est plus importé ici.
// import { LandingComponent } from './components/landing/landing.component'; // À SUPPRIMER

@Component({
  selector: 'app-root',
  standalone: true,
  // Retirez LandingComponent de la liste des imports si présent
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'E.M.E.S. App';
}