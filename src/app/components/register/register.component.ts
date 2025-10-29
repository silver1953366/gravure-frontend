import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
// Importez tous les outils nécessaires pour les formulaires réactifs
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// Fonction de validation personnalisée pour vérifier l'égalité des mots de passe
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const passwordConfirmation = control.get('password_confirmation');

  // Si les mots de passe existent et sont différents, retourne l'erreur 'mismatch'
  if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
    // Cette erreur sera attachée au FormGroup, pas au champ individuel.
    return { mismatch: true }; 
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  // Déclarer les modules pour le template
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  errorMessage: string = '';

  ngOnInit(): void {
    // Initialisation du formulaire avec validation
    this.registerForm = this.fb.group({
      // 1. Champ 'name' (correspond à votre API)
      name: ['', Validators.required],
      // 2. Champ 'email'
      email: ['', [Validators.required, Validators.email]],
      // 3. Champ 'password'
      password: ['', [Validators.required, Validators.minLength(8)]],
      // 4. Champ 'password_confirmation' (nécessaire pour la validation côté Laravel)
      password_confirmation: ['', Validators.required]
    }, {
      // Appliquer le validateur de correspondance au niveau du groupe de formulaires
      validators: passwordMatchValidator 
    });
  }
  
onSubmit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.authService.register(this.registerForm.value).subscribe({
      // Ajout de ': any' pour résoudre TS7006
      next: (response: any) => {
        this.router.navigate(['/login']); 
      },
      // Ajout de ': any' pour résoudre TS7006
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
        console.error('Erreur d\'inscription:', err);
      }
    });
  }
}