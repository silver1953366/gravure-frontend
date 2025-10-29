import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
// Importez tous les outils nécessaires pour les formulaires réactifs
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Assurez-vous d'importer ReactiveFormsModule pour que les formulaires fonctionnent
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  errorMessage: string = '';

  ngOnInit(): void {
    // Initialisation du formulaire
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      // Ajout de ': any' pour résoudre TS7006
      next: (response: any) => { 
        this.authService.getUserProfile().subscribe({
          next: (user) => {
            this.router.navigate(['/dashboard']); 
          },
          // Ajout de ': any' pour résoudre TS7006
          error: (err: any) => {
            this.errorMessage = 'Erreur de récupération du profil après connexion.';
          }
        });
      },
      // Ajout de ': any' pour résoudre TS7006
      error: (err: any) => { 
        this.errorMessage = err.error?.message || 'Identifiants incorrects ou erreur serveur.';
        console.error('Erreur de connexion:', err);
      }
    });
  }
}