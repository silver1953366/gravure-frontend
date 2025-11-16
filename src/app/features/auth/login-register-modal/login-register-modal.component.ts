import { Component, signal, OnInit, computed, input, output, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth.service';
import { RegisterPayload } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  
  // 🛑 Désactive l'encapsulation de style d'Angular 
  encapsulation: ViewEncapsulation.None, 

  // 💥 TEMPLATE FINAL : Inclut les logos et les fonctions de connexion sociale
  template: `
    <div 
      *ngIf="isOpen()" 
      class="modal-overlay-bg"
      (click)="closeModal()">
      
      <div 
        class="container"
        [class.right-panel-active]="mode() === 'register'" 
        (click)="$event.stopPropagation()">

        <div class="form-container sign-up-container">
          <form #registerForm="ngForm" (ngSubmit)="handleAuth()">
            <button type="button" (click)="closeModal()" class="close-button-top-right">
                &times;
            </button>
            <h1>S'inscrire</h1>
            
            <div class="social-container">
              <a href="javascript:void(0)" class="social" (click)="loginWithFacebook()"><i class="fab fa-facebook-f"></i></a>
              <a href="javascript:void(0)" class="social" (click)="loginWithGoogle()"><i class="fab fa-google-plus-g"></i></a>
              <a href="javascript:void(0)" class="social" (click)="loginWithLinkedin()"><i class="fab fa-linkedin-in"></i></a>
            </div>
            
            <div *ngIf="error()" class="error-message">{{ error() }}</div>
            
            <div class="input-group">
                <i class="fas fa-user icon"></i>
                <input type="text" placeholder="Nom" name="name" [(ngModel)]="name" required />
            </div>
            
            <div class="input-group">
                <i class="fas fa-envelope icon"></i>
                <input type="email" placeholder="Email" name="email" [(ngModel)]="email" required />
            </div>

            <div class="input-group">
                <i class="fas fa-lock icon"></i>
                <input 
                    [type]="isPasswordVisible() ? 'text' : 'password'" 
                    placeholder="Mot de passe" 
                    name="password" 
                    [(ngModel)]="password" 
                    required 
                />
                <i 
                    class="eye-icon fas"
                    [class.fa-eye]="isPasswordVisible()"              
                    [class.fa-eye-slash]="!isPasswordVisible()"      
                    (click)="togglePasswordVisibility()">
                </i>
            </div>
            
            <div class="input-group">
                <i class="fas fa-lock icon"></i>
                <input 
                    [type]="isPasswordVisible() ? 'text' : 'password'" 
                    placeholder="Confirmer mot de passe" 
                    name="confirmPassword" 
                    [(ngModel)]="confirmPassword" 
                    required 
                />
                <i 
                    class="eye-icon fas"
                    [class.fa-eye]="isPasswordVisible()"              
                    [class.fa-eye-slash]="!isPasswordVisible()"      
                    (click)="togglePasswordVisibility()">
                </i>
            </div>
            
            <button type="submit" [disabled]="isLoading() || registerForm.invalid">
              <span *ngIf="!isLoading()">Inscription</span>
              <span *ngIf="isLoading()">Chargement...</span>
            </button>
          </form>
        </div>

        <div class="form-container sign-in-container">
          <form #loginForm="ngForm" (ngSubmit)="handleAuth()">
            <button type="button" (click)="closeModal()" class="close-button-top-right">
                &times;
            </button>
            <h1>Se Connecter</h1>
            
            <div class="social-container">
              <a href="javascript:void(0)" class="social" (click)="loginWithFacebook()"><i class="fab fa-facebook-f"></i></a>
              <a href="javascript:void(0)" class="social" (click)="loginWithGoogle()"><i class="fab fa-google-plus-g"></i></a>
              <a href="javascript:void(0)" class="social" (click)="loginWithLinkedin()"><i class="fab fa-linkedin-in"></i></a>
            </div>
            
            <div *ngIf="error()" class="error-message">{{ error() }}</div>
            
            <div class="input-group">
                <i class="fas fa-envelope icon"></i>
                <input type="email" placeholder="Email" name="email" [(ngModel)]="email" required />
            </div>

            <div class="input-group">
                <i class="fas fa-lock icon"></i>
                <input 
                    [type]="isPasswordVisible() ? 'text' : 'password'" 
                    placeholder="Mot de passe" 
                    name="password" 
                    [(ngModel)]="password" 
                    required 
                />
                <i 
                    class="eye-icon fas"
                    [class.fa-eye]="isPasswordVisible()"              
                    [class.fa-eye-slash]="!isPasswordVisible()"      
                    (click)="togglePasswordVisibility()">
                </i>
            </div>
            
            <a href="#">Mot de passe oublié?</a>
            
            <button type="submit" [disabled]="isLoading() || loginForm.invalid">
              <span *ngIf="!isLoading()">Connexion</span>
              <span *ngIf="isLoading()">Chargement...</span>
            </button>
          </form>
        </div>

        <div class="overlay-container">
          <div class="overlay">
            
            <div class="overlay-panel overlay-left">
              <div class="logo-container">
                  <img src="../../../../assets/Logo/logo.png" alt="Logo EMES" class="overlay-logo">
              </div>
              
              <h1>Se connecter</h1>
              <p>Vous avez déjà un compte ? Connectez-vous !</p>
              <button class="ghost" (click)="toggleMode()">Connexion</button>
            </div>
            
            <div class="overlay-panel overlay-right">
              <div class="logo-container">
                  <img src=".../../../../../../assets/Logo/logo.png" alt="Logo EMES" class="overlay-logo">
              </div>
              
              <h1>Créer un compte</h1>
              <p>Êtes-vous nouveau ? Créez votre compte et commencez votre aventure.</p>
              <button class="ghost" (click)="toggleMode()">Créer un compte</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login-register-modal.component.css'
})
export class LoginRegisterModalComponent {
  
  private authService = inject(AuthService);

  // Entrée et Sortie
  isOpen = input<boolean>(false); 
  close = output<void>();

  // États du formulaire
  mode = signal<'login' | 'register'>('login');
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  // État pour gérer la visibilité du mot de passe
  isPasswordVisible = signal(false);

  // États de la logique
  error = signal<string>('');
  isLoading = signal(false);

  // Propriétés calculées
  title = computed(() => this.mode() === 'login' ? 'Connexion à E.M.E.S.' : 'Inscription E.M.E.S.');
  switchText = computed(() => this.mode() === 'login' ? "Pas encore de compte ? S'inscrire" : "Vous avez déjà un compte ? Se connecter");

  // Logique pour basculer l'état du mot de passe
  togglePasswordVisibility(): void {
    this.isPasswordVisible.update(current => !current);
  }

  // 💥 NOUVEAU : Logique des connexions sociales (à implémenter)
  loginWithFacebook(): void {
    this.error.set('');
    console.log("Tentative de connexion via Facebook...");
    // ℹ️ Ajouter ici l'appel à votre service pour démarrer la connexion OAuth/SDK
  }

  loginWithGoogle(): void {
    this.error.set('');
    console.log("Tentative de connexion via Google...");
    // ℹ️ Ajouter ici l'appel à votre service pour démarrer la connexion OAuth/SDK
  }

  loginWithLinkedin(): void {
    this.error.set('');
    console.log("Tentative de connexion via LinkedIn...");
    // ℹ️ Ajouter ici l'appel à votre service pour démarrer la connexion OAuth/SDK
  }
  // Fin des nouvelles fonctions

  // Logique principale de soumission du formulaire
  handleAuth(): void {
    this.error.set('');
    this.isLoading.set(true);

    if (this.mode() === 'login') {
      this.login();
    } else {
      this.register();
    }
  }

  // Gère le processus de connexion via l'AuthService
  private login(): void {
    const payload = { email: this.email, password: this.password };
    
    this.authService.login(payload).subscribe({
      next: () => {
        // Arrêt du chargement et fermeture automatique.
        this.isLoading.set(false);
        this.closeModal(); 
      },
      error: (err) => {
        console.error("Erreur de connexion:", err);
        let errorMessage = "Erreur de connexion. Veuillez vérifier vos identifiants.";
        if (err.status === 422 && err.error && err.error.errors) {
            const errorMessages = Object.values(err.error.errors).flat();
            errorMessage = errorMessages.join(' / ');
        }
        this.error.set(errorMessage);
        this.isLoading.set(false);
      },
    });
  }

  // Gère le processus d'inscription via l'AuthService
  private register(): void {
    if (this.password !== this.confirmPassword) {
      this.error.set("Les mots de passe ne correspondent pas.");
      this.isLoading.set(false);
      return;
    }

    const payload: RegisterPayload = { name: this.name, email: this.email, password: this.password };

    this.authService.register(payload).subscribe({
      next: () => {
        // Arrêt du chargement et fermeture automatique.
        this.isLoading.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error("Erreur d'inscription:", err);
        let errorMessage = "Erreur lors de l'inscription. L'email est peut-être déjà utilisé.";
        if (err.status === 422 && err.error && err.error.errors) {
            const errorMessages = Object.values(err.error.errors).flat();
            errorMessage = errorMessages.join(' / ');
        }
        this.error.set(errorMessage);
        this.isLoading.set(false);
      },
    });
  }

  // Inverse le mode entre Connexion et Inscription
  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set(''); 
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  // Fonction pour fermer le modal et notifier le parent
  closeModal(): void {
    // Réinitialisation des champs du formulaire
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.error.set('');
    this.isLoading.set(false); 
    this.close.emit();
  }
}