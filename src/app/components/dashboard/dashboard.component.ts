import { Component, OnInit, inject } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit { 
  
  // Injection des dépendances pour le service d'authentification et le routeur
  private authService = inject(AuthService); 
  private router = inject(Router); 
  
  ngOnInit(): void {
    // Logique d'initialisation (ex: charger les données de l'utilisateur)
  }

  /**
   * Gère le processus de déconnexion de l'utilisateur.
   * Il tente d'abord de déconnecter via l'API, puis nettoie localement.
   */
  onLogout(): void {
    // Appelle la méthode logout du service d'authentification
    this.authService.logout().subscribe({
      next: () => {
        this.cleanUpAndRedirect();
      },
      error: () => {
        // En cas d'échec de l'API (ex: jeton invalide), on nettoie quand même localement
        console.warn("Erreur de l'API de déconnexion, nettoyage local forcé.");
        this.cleanUpAndRedirect();
      }
    });
  }

  /**
   * Supprime le jeton du stockage local et redirige vers la page de connexion.
   */
  private cleanUpAndRedirect(): void {
    // S'assurer que les deux clés possibles sont supprimées pour la compatibilité
    localStorage.removeItem('auth_token'); 
    localStorage.removeItem('access_token');
    
    // Redirection vers la page de connexion
    this.router.navigate(['/login']); 
  }
}
