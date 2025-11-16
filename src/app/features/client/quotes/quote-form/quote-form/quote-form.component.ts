import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialDimension } from '../../../../../core/models/material-dimension.model';

// CORRECTION : Utilisation du service centralisé (core/services/client)
import { QuoteFormService } from '../../../../../core/services/client/quote-form.service'; 

@Component({
  selector: 'app-quote-form',
  standalone: true,
  templateUrl: './quote-form.component.html',
  // ATTENTION: Le chemin vers le style est toujours relatif au composant
  styleUrl: './quote-form.component.css',
  imports: [CommonModule, ReactiveFormsModule]
})
export class QuoteFormComponent {
  selectedDimension = input<MaterialDimension | null>(null);

  private fb = inject(FormBuilder);
  // CORRECTION : Injection du nouveau service
  private quoteService = inject(QuoteFormService); 

  quoteForm: FormGroup;
  selectedFile: File | null = null;
  
  submissionStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  submissionMessage = signal<string | null>(null);

  constructor() {
    this.quoteForm = this.fb.group({
      // Informations client
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      
      // Informations projet
      quantity: [1, [Validators.required, Validators.min(1)]],
      description: [''],
      
      // Le fichier est toujours géré séparément
      file: [null] 
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  onSubmit(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      this.submissionMessage.set("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!this.selectedDimension()) {
      this.submissionMessage.set("Veuillez sélectionner une dimension avant de soumettre.");
      return;
    }

    this.submissionStatus.set('loading');
    this.submissionMessage.set(null);

    const formValue = this.quoteForm.value;
    const formData = new FormData();

    Object.keys(formValue).forEach(key => {
      // Exclure 'file' qui est un FormControl bidon
      if (key !== 'file') {
          formData.append(key, formValue[key]);
      }
    });

    // 2. Ajouter les IDs du produit configuré
    // Utilisation de l'opérateur non-null (!) puisque la vérification est faite juste avant
    formData.append('material_dimension_id', this.selectedDimension()!.id.toString());
    formData.append('material_id', this.selectedDimension()!.material_id.toString());
    formData.append('shape_id', this.selectedDimension()!.shape_id.toString());
    
    // 3. Ajouter le fichier
    if (this.selectedFile) {
      formData.append('project_file', this.selectedFile, this.selectedFile.name);
    }
    
    // Appel au service pour envoyer les données
    this.quoteService.sendQuote(formData).subscribe({
      next: () => {
        this.submissionStatus.set('success');
        this.submissionMessage.set('Votre demande de devis a été envoyée avec succès!');
        this.quoteForm.reset({ quantity: 1 }); // Réinitialise la quantité à 1
        this.selectedFile = null;
      },
      error: (err) => {
        console.error("Erreur d'envoi du devis:", err);
        this.submissionStatus.set('error');
        // Afficher l'erreur du serveur si possible (ex: err.error.message)
        const errorMessage = err.error?.message || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
        this.submissionMessage.set(errorMessage);
      }
    });
  }
}