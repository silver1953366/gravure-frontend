import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  // NOTE: HttpClientModule n'est plus nécessaire ici
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  // Propriétés simplifiées pour la démo
  isSignUpMode: boolean = false;
  loginData = { username: '', password: '' };
  registerData = { username: '', email: '', password: '' };
  
  // Remplacer par des indicateurs de démo
  isSubmitting: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Détermine si on est sur /register pour l'état initial
    this.route.url.subscribe(urlSegments => {
      this.isSignUpMode = urlSegments.some(segment => segment.path === 'register');
      this.updateAnimationState();
    });
  }

  // 🌀 Gère le changement d’état DOM et déclenche la transition CSS
  private updateAnimationState(): void {
    const container = document.querySelector('.container');
    if (container) {
      if (this.isSignUpMode) {
        container.classList.add('sign-up-mode');
      } else {
        container.classList.remove('sign-up-mode');
      }
    }
  }

  // 🔄 Navigation vers Inscription
  navigateToRegister(): void {
    this.isSignUpMode = true;
    this.updateAnimationState();
    // Utiliser setTimeout pour laisser l'animation CSS se déclencher avant la navigation
    setTimeout(() => this.router.navigate(['/register']), 600); 
  }

  // 🔄 Navigation vers Connexion
  navigateToLogin(): void {
    this.isSignUpMode = false;
    this.updateAnimationState();
    setTimeout(() => this.router.navigate(['/login']), 600);
  }

  // 🔐 Soumission de Connexion (Simulation)
  onLoginSubmit(): void {
    this.isSubmitting = true;
    console.log('Connexion simulée avec:', this.loginData);
    
    // Simuler un délai de connexion de 2 secondes
    setTimeout(() => {
      this.isSubmitting = false;
      // Redirection après succès de la simulation
      console.log('Connexion réussie (simulation)');
      this.router.navigate(['/client/dashboard']); 
    }, 2000);
  }

  // 📝 Soumission d'Inscription (Simulation)
  onRegisterSubmit(): void {
    this.isSubmitting = true;
    console.log('Inscription simulée avec:', this.registerData);

    // Simuler un délai d'inscription de 2 secondes
    setTimeout(() => {
      this.isSubmitting = false;
      console.log('Inscription réussie (simulation), redirection vers login...');
      this.navigateToLogin(); // Rediriger vers login après l'inscription
    }, 2000);
  }
}