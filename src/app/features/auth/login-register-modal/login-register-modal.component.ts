// src/app/features/auth/login-register-modal/login-register-modal.component.ts

import { Component, signal, input, output, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service'; 
// Assurez-vous d'ajuster le chemin de l'AuthService ci-dessus si nécessaire.

@Component({
  selector: 'app-login-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], 
  encapsulation: ViewEncapsulation.None, 
  templateUrl: './login-register-modal.component.html',
  styleUrl: './login-register-modal.component.css'
})
export class LoginRegisterModalComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  // 🛑 INPUT : Reçoit l'état du parent
  isOpen = input<boolean>(false);
  // 🛑 OUTPUT : Émet l'événement de fermeture au parent
  close = output<void>(); 

  mode = signal<'login' | 'register'>('login');
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  isPasswordVisible = signal(false);
  error = signal<string>('');
  isLoading = signal(false);

  handleAuth(): void {
    this.error.set('');
    this.isLoading.set(true);

    if (this.mode() === 'login') {
      const payload = { email: this.email, password: this.password };
      
      this.authService.login(payload).subscribe({
        next: () => {
          this.handleSuccess("Connexion réussie !");
        },
        error: (err) => {
          this.handleError(err, "Échec de la connexion. Veuillez vérifier vos identifiants.");
        }
      });

    } else {
      if (this.password !== this.confirmPassword) {
        this.error.set("Les mots de passe ne correspondent pas.");
        this.isLoading.set(false);
        return;
      }
      const payload = { name: this.name, email: this.email, password: this.password };
      
      this.authService.register(payload).subscribe({
        next: () => {
          this.handleSuccess("Inscription réussie et connexion automatique !");
        },
        error: (err) => {
          this.handleError(err, "Échec de l'inscription.");
        }
      });
    }
  }

  private handleSuccess(message: string): void {
    this.isLoading.set(false);
    console.log(message);
    this.closeModal();
    
  }

  private handleError(err: any, defaultMessage: string): void {
    this.isLoading.set(false);
    const apiError = err.error?.message || err.message;
    this.error.set(apiError || defaultMessage);
    console.error("Erreur API:", err);
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update(current => !current);
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.resetFormState();
  }

  // 🛑 ESSENTIEL : Cette méthode émet l'événement de fermeture au parent.
  closeModal(): void {
    this.resetFormState();
    this.close.emit();
  }
  
  private resetFormState(): void {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.error.set('');
    this.isLoading.set(false);
  }
}