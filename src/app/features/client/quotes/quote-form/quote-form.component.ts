import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, of, filter, tap, forkJoin, timeout } from 'rxjs';
import { Router } from '@angular/router';

// Modèles
import { Material } from '../../../../core/models/material.model';
import { Shape } from '../../../../core/models/shape.model';
import { QuoteEstimate, QuotePayload } from '../../../../core/models/client/quotes/quote.model';
import { MaterialDimension } from '../../../../core/models/material-dimension.model';
import { Attachment } from '../../../../core/models/client/quotes/attachment.model';

// Services
import { QuoteFormService } from '../../../../core/services/client/quote-form.service';
import { ClientQuoteService } from '../../../../core/services/client/client-quote.service';
import { AuthService } from '../../../../core/services/auth.service';

// Composants
import { AttachmentUploaderComponent } from '../components/attachment/attachment-uploader/attachment-uploader.component'; 

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AttachmentUploaderComponent], 
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.css']
})
export class QuoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);
  private quoteFormService = inject(QuoteFormService);
  private clientQuoteService = inject(ClientQuoteService);
  private authService = inject(AuthService);

  // Formulaire réactif
  quoteForm!: FormGroup;

  // --- Signals de données (Catalogues) ---
  materials = signal<Material[]>([]);
  shapes = signal<Shape[]>([]);
  dimensions = signal<MaterialDimension[]>([]);
  filteredDimensions = signal<MaterialDimension[]>([]);

  // --- Signals d'état et résultats ---
  isDataLoading = signal(true);
  isEstimating = signal(false);
  isSubmitting = signal(false);
  
  estimate = signal<QuoteEstimate | null>(null);
  estimateError = signal<string | null>(null);
  attachments = signal<Attachment[]>([]);
  
  // Identifiant temporaire pour lier les uploads avant création du devis
  quoteIdForAttachments = signal<number>(Math.floor(Date.now() / 1000)); 

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData(); 
  }

  private initForm(): void {
    this.quoteForm = this.fb.group({
      material_id: [null, [Validators.required]],
      shape_id: [null, [Validators.required]],
      material_dimension_id: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      description: [''] 
    });
  }

  /**
   * Charge les données du catalogue et vérifie si un panier doit être converti
   */
  private loadInitialData(): void {
    this.isDataLoading.set(true);
    
    forkJoin({
      selections: this.quoteFormService.getFormSelections(),
      cart: this.quoteFormService.getCartContent().pipe(
        timeout(3000), 
        catchError(() => of([]))
      )
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.materials.set(data.selections.materials);
        this.shapes.set(data.selections.shapes);
        this.dimensions.set(data.selections.dimensions);

        // Si l'utilisateur venait du panier, on pré-remplit le formulaire
        if (data.cart && data.cart.length > 0) {
          const payload = this.quoteFormService.convertCartToQuotePayload(data.cart);
          if (payload) this.quoteForm.patchValue(payload);
        }

        this.isDataLoading.set(false);
        this.setupFormListeners(); 
      },
      error: (err) => {
        console.error("Erreur d'initialisation:", err);
        this.estimateError.set("Impossible de charger les options techniques. Vérifiez votre connexion.");
        this.isDataLoading.set(false);
      }
    });
  }

  /**
   * Écoute les changements du formulaire pour filtrer les dimensions et estimer le prix
   */
  private setupFormListeners(): void {
    const formChanges$ = this.quoteForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef));

    // 1. Filtrage dynamique des dimensions selon le matériau et la forme
    formChanges$.pipe(
      tap(val => {
        if (val.material_id && val.shape_id) {
          this.filterDimensions(val.material_id, val.shape_id);
        }
      })
    ).subscribe();

    // 2. Estimation automatique du prix avec Debounce (Attente de 600ms sans saisie)
    formChanges$.pipe(
      debounceTime(600),
      filter(() => {
        const v = this.quoteForm.value;
        return !!(v.material_id && v.shape_id && v.material_dimension_id);
      }),
      tap(() => {
        this.isEstimating.set(true);
        this.estimateError.set(null);
      }),
      switchMap(() => this.clientQuoteService.estimateQuote(this.quoteForm.value).pipe(
        catchError(err => {
          this.estimateError.set(err.error?.error || "Prix indisponible pour cette configuration.");
          this.estimate.set(null);
          return of(null);
        })
      ))
    ).subscribe(res => {
      this.isEstimating.set(false);
      if (res) this.estimate.set(res);
    });
  }

  private filterDimensions(mId: number, sId: number): void {
    const filtered = this.dimensions().filter(d => d.material_id === mId && d.shape_id === sId);
    this.filteredDimensions.set(filtered);
    
    // Reset de la sélection si elle n'est plus valide dans la nouvelle liste
    const currentDim = this.quoteForm.get('material_dimension_id')?.value;
    if (currentDim && !filtered.some(d => d.id === currentDim)) {
      this.quoteForm.get('material_dimension_id')?.setValue(null);
    }
  }

  // --- Gestion des fichiers joints ---
  onAttachmentAdded(a: Attachment): void { 
    this.attachments.update(as => [...as, a]); 
  }

  onAttachmentRemoved(id: number): void { 
    this.attachments.update(as => as.filter(a => a.id !== id)); 
  }

  goBack(): void { 
    this.location.back(); 
  }

  /**
   * Envoi final du devis au backend
   */
  onSubmit(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.estimateError.set(null);

    const user = this.authService.currentUser(); 
    const formValue = this.quoteForm.getRawValue();

    // Structuration du payload final pour le backend Laravel
    const finalPayload: QuotePayload = {
      material_id: formValue.material_id,
      shape_id: formValue.shape_id,
      material_dimension_id: formValue.material_dimension_id,
      quantity: formValue.quantity,
      client_details: {
        name: user?.name || 'Client',
        email: user?.email || '',
        phone: (user as any)?.phone || '' 
      },
      customization_details: {
        description: formValue.description
      },
      files: this.attachments().map(a => a.id)
    };

    this.clientQuoteService.submitQuote(finalPayload).subscribe({
      next: (res) => {
        // Redirection vers la vue détail du devis nouvellement créé
        this.router.navigate(['/client/quotes', res.quote.id]);
      },
      error: (err) => {
        console.error("Erreur soumission finale:", err);
        this.isSubmitting.set(false);
        this.estimateError.set(err.error?.message || "Erreur lors de l'enregistrement de votre demande.");
      }
    });
  }
}