import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, of, filter, tap, forkJoin } from 'rxjs';
import { Router } from '@angular/router';

// Imports des modèles
import { Material } from '../../../../core/models/material.model';
import { Shape } from '../../../../core/models/shape.model';
import { QuoteEstimate } from '../../../../core/models/client/quotes/quote.model';
import { MaterialDimension } from '../../../../core/models/material-dimension.model';
import { Attachment } from '../../../../core/models/client/quotes/attachment.model'; // NOUVEL IMPORT

// Imports des services
import { QuoteFormService } from '../../../../core/services/client/quote-form.service';
import { ClientQuoteService } from '../../../../core/services/client/client-quote.service';
// Import du composant enfant
import { AttachmentUploaderComponent } from '../components/attachment/attachment-uploader/attachment-uploader.component'; 

@Component({
    selector: 'app-quote-form',
    standalone: true,
    // Ajout du composant d'upload
    imports: [CommonModule, ReactiveFormsModule, AttachmentUploaderComponent], 
    templateUrl: './quote-form.component.html',
    styleUrls: ['./quote-form.component.css']
})
export class QuoteFormComponent implements OnInit {

    // --- Services Injectés ---
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private quoteFormService = inject(QuoteFormService);
    private clientQuoteService = inject(ClientQuoteService);

    // --- Formulaire Réactif ---
    quoteForm!: FormGroup;

    // --- Signals pour la Gestion de l'État et des Données ---
    materials = signal<Material[]>([]);
    shapes = signal<Shape[]>([]);
    dimensions = signal<MaterialDimension[]>([]);
    filteredDimensions = signal<MaterialDimension[]>([]);

    isDataLoading = signal(true);
    isEstimating = signal(false);
    isSubmitting = signal(false);
    
    estimate = signal<QuoteEstimate | null>(null);
    estimateError = signal<string | null>(null);

    // Gestion des pièces jointes
    attachments = signal<Attachment[]>([]);
    // ID temporaire/DRAFT de devis utilisé par l'uploader. (Ex: ID de session DRAFT)
    // Pour le cas de figure 'Nouveau Devis', cet ID doit être initialisé
    // par le backend au chargement du formulaire (sauvegarde DRAFT implicite).
    quoteIdForAttachments = signal<number>(123); // ID fictif pour l'exemple

    ngOnInit(): void {
        this.initForm();
        this.loadInitialData(); 
    }

    /**
     * Initialise le Formulaire Réactif
     */
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
     * Charge les listes initiales (Matériaux, Formes, Dimensions) et les données du panier.
     */
    private loadInitialData(): void {
        this.isDataLoading.set(true);

        const formSelections$ = this.quoteFormService.getFormSelections();
        const cartContent$ = this.quoteFormService.getCartContent().pipe(
            catchError(() => of([])) 
        );

        forkJoin({
            selections: formSelections$,
            cart: cartContent$
        }).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError(error => {
                console.error("Erreur de chargement des données initiales", error);
                this.isDataLoading.set(false);
                this.estimateError.set("Impossible de charger les données du formulaire.");
                return of(null);
            })
        ).subscribe(data => {
            if (data) {
                // 1. Stockage des listes de sélection
                this.materials.set(data.selections.materials);
                this.shapes.set(data.selections.shapes);
                this.dimensions.set(data.selections.dimensions);
                
                // 2. Initialisation depuis le panier si des articles sont présents
                if (data.cart && data.cart.length > 0) {
                    const payload = this.quoteFormService.convertCartToQuotePayload(data.cart);
                    if (payload) {
                        this.quoteForm.patchValue(payload);
                    }
                }
                
                this.isDataLoading.set(false);
                this.setupFormListeners(); 
            }
        });
    }

    /**
     * Configure l'estimation en temps réel et le filtrage des dimensions.
     */
    private setupFormListeners(): void {
        const formChanges$ = this.quoteForm.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        );

        // 1. Filtrage des Dimensions disponibles
        formChanges$.pipe(
            filter(changes => changes.material_id !== null && changes.shape_id !== null),
            tap(changes => this.filterDimensions(changes.material_id, changes.shape_id))
        ).subscribe();

        // 2. Estimation de Prix en temps réel (débounced)
        formChanges$.pipe(
            debounceTime(500),
            filter(() => this.quoteForm.valid),
            tap(() => this.isEstimating.set(true)),
            switchMap(() => this.clientQuoteService.estimateQuote(this.quoteForm.value).pipe(
                catchError(error => {
                    this.estimateError.set("Impossible d'estimer le prix. Veuillez vérifier les valeurs.");
                    this.isEstimating.set(false);
                    return of(null);
                })
            ))
        ).subscribe((estimateResult) => {
            this.isEstimating.set(false);
            if (estimateResult) {
                this.estimate.set(estimateResult);
                this.estimateError.set(null);
            }
        });
    }

    /**
     * Filtre la liste des dimensions en fonction du Matériau et de la Forme sélectionnés.
     */
    private filterDimensions(materialId: number, shapeId: number): void {
        const filtered = this.dimensions().filter(d => 
            d.material_id === materialId && d.shape_id === shapeId
        );
        
        this.filteredDimensions.set(filtered);

        const currentDimensionId = this.quoteForm.get('material_dimension_id')?.value;
        // Si la dimension actuelle n'est plus disponible, on la réinitialise
        if (currentDimensionId && !filtered.some(d => d.id === currentDimensionId)) {
            this.quoteForm.get('material_dimension_id')?.setValue(null);
            this.estimate.set(null); 
        }
    }

    /**
     * Ajoute une pièce jointe reçue de l'uploader au Signal local.
     */
    onAttachmentAdded(attachment: Attachment): void {
        this.attachments.update(atts => [...atts, attachment]);
    }

    /**
     * Retire une pièce jointe du Signal local.
     */
    onAttachmentRemoved(attachmentId: number): void {
        this.attachments.update(atts => atts.filter(a => a.id !== attachmentId));
    }


    /**
     * Gère la soumission finale du devis.
     */
    onSubmit(): void {
        if (this.quoteForm.invalid) {
            this.quoteForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.estimateError.set(null);

        // Le devis est soumis. Le backend est responsable de lier les attachements (ID fictif) au nouvel ID de devis.
        this.clientQuoteService.submitQuote(this.quoteForm.value).pipe(
            catchError(error => {
                console.error("Erreur de soumission", error);
                this.estimateError.set("Erreur lors de l'enregistrement du devis. Veuillez réessayer.");
                this.isSubmitting.set(false);
                return of(null);
            })
        ).subscribe(response => {
            this.isSubmitting.set(false);
            if (response && response.quote) {
                // Redirection vers la page de détail du devis nouvellement créé
                this.router.navigate(['/client/quotes', response.quote.id]);
            }
        });
    }

}