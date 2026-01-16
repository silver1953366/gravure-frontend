// src/app/features/client/quotes/quote-form/quote-form.component.ts

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
  isSavingDraft = signal(false); // État pour le bouton brouillon
  
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
   * Charge les données du catalogue
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

        if (data.cart && data.cart.length > 0) {
          const payload = this.quoteFormService.convertCartToQuotePayload(data.cart);
          if (payload) this.quoteForm.patchValue(payload);
        }

        this.isDataLoading.set(false);
        this.setupFormListeners(); 
      },
      error: (err) => {
        console.error("Erreur d'initialisation:", err);
        this.estimateError.set("Impossible de charger les options techniques.");
        this.isDataLoading.set(false);
      }
    });
  }

  /**
   * Écouteurs de changements pour le filtrage et l'estimation
   */
  private setupFormListeners(): void {
    const formChanges$ = this.quoteForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef));

    formChanges$.pipe(
      tap(val => {
        if (val.material_id && val.shape_id) {
          this.filterDimensions(val.material_id, val.shape_id);
        }
      })
    ).subscribe();

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
          this.estimateError.set(err.error?.error || "Prix indisponible.");
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
    
    const currentDim = this.quoteForm.get('material_dimension_id')?.value;
    if (currentDim && !filtered.some(d => d.id === currentDim)) {
      this.quoteForm.get('material_dimension_id')?.setValue(null);
    }
  }

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
   * Soumission du formulaire (Envoi ou Brouillon)
   */
  submitForm(isDraft: boolean = false): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    // Mise à jour de l'état selon l'action
    if (isDraft) this.isSavingDraft.set(true);
    else this.isSubmitting.set(true);

    this.estimateError.set(null);

    const user = this.authService.currentUser(); 
    const formValue = this.quoteForm.getRawValue();

    const finalPayload: QuotePayload = {
      material_id: formValue.material_id,
      shape_id: formValue.shape_id,
      material_dimension_id: formValue.material_dimension_id,
      quantity: formValue.quantity,
      // On passe le statut souhaité au backend
      status: isDraft ? 'draft' : 'sent', 
      client_details: {
        name: user?.name || 'Client',
        email: user?.email || '',
        phone: (user as any)?.phone || '' 
      },
      customization_details: {
        description: formValue.description
      },
      file_ids: this.attachments().map(a => a.id),
    };

    this.clientQuoteService.submitQuote(finalPayload).subscribe({
      next: (res) => {
        if (isDraft) {
          // Si brouillon, on retourne à la liste
          this.router.navigate(['/client/quotes']);
        } else {
          // Si envoi, on va au détail du devis
          this.router.navigate(['/client/quotes', res.quote.id]);
        }
      },
      error: (err) => {
        console.error("Erreur soumission:", err);
        this.isSubmitting.set(false);
        this.isSavingDraft.set(false);
        this.estimateError.set(err.error?.message || "Erreur lors de l'enregistrement.");
      }
    });
  }

  /**
   * Méthode appelée par le (ngSubmit) du formulaire
   */
  onSubmit(): void {
    this.submitForm(false);
  }
}