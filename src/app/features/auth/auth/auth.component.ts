import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Importation du service d'authentification (chemin relatif)
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  // Styles de base intégrés pour la mise en forme de test
  styles: [`
    .auth-container { max-width: 400px; margin: 50px auto; padding: 30px; border: 1px solid #ddd; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    form { display: flex; flex-direction: column; gap: 15px; }
    label { font-weight: 600; font-size: 0.9em; margin-bottom: 4px; display: block;}
    input { padding: 12px; border: 1px solid #ccc; border-radius: 6px; transition: border-color 0.3s; }
    input:focus { border-color: #007bff; outline: none; }
    button { padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background-color 0.3s; }
    button:hover:not([disabled]) { background-color: #0056b3; }
    button:disabled { background-color: #a0c3e8; cursor: not-allowed; }
    .error { color: #d9534f; background-color: #fdd; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid #d9534f; }
    .toggle-link { text-align: center; margin-top: 20px; cursor: pointer; color: #007bff; text-decoration: none; font-size: 0.9em; }
    .toggle-link:hover { text-decoration: underline; }
    .text-center { text-align: center; }
  `]
})
export class AuthComponent implements OnInit {
  // État pour basculer entre les deux formulaires
  isLoginMode: boolean = true; 

  // Modèles de données pour les formulaires
  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Gestion de l'état
  isLoading: boolean = false;
  error: string | null = null;
  
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Si l'utilisateur est déjà authentifié, le rediriger
    if (this.authService.isAuthenticated()) {
      // Rediriger vers le tableau de bord client (ou la route la plus appropriée)
      this.router.navigate(['/client/dashboard']); 
    }
    
    // Déterminer le mode en fonction de l'URL pour gérer les redirections directes vers /auth/register
    const currentPath = this.router.url;
    this.isLoginMode = !currentPath.includes('/register');
  }

  /**
   * Bascule entre le formulaire de connexion et d'inscription.
   */
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null; // Réinitialiser les erreurs
    
    // Mise à jour de l'URL pour refléter le mode
    const newPath = this.isLoginMode ? '/auth/login' : '/auth/register';
    this.router.navigate([newPath]);
  }

  /**
   * Soumet le formulaire d'authentification (Connexion ou Inscription).
   */
  onSubmit(): void {
    this.error = null;
    this.isLoading = true;

    if (this.isLoginMode) {
      // Logique de Connexion
      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
          this.router.navigate(['/client/dashboard']); // Redirection après succès
        },
        error: (err: Error) => {
          this.error = err.message;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Logique d'Inscription
      if (this.registerData.password !== this.registerData.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas.';
        this.isLoading = false;
        return;
      }

      const { name, email, password } = this.registerData;
      this.authService.register({ name, email, password }).subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);
          this.router.navigate(['/client/dashboard']); // Redirection après succès
        },
        error: (err: Error) => {
          this.error = err.message;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}