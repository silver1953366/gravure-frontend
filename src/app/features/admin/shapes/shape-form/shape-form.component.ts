import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ShapeService, Shape } from '../shape.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule], 
    selector: 'app-shape-form',
    templateUrl: './shape-form.component.html',
    styleUrls: ['./shape-form.component.css']
})
export class ShapeFormComponent implements OnInit {
    
    shapeForm: FormGroup;
    currentShapeId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private shapeService: ShapeService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // Définition du formulaire
        this.shapeForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            slug: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]], // Validation du slug
            description: [''],
            image_url: [''],
            is_active: [true], // Par défaut, la forme est active
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentShapeId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentShapeId;
            
            if (this.isEditMode) {
                this.loadShapeData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    loadShapeData(): void {
        this.isLoading = true;
        this.shapeService.getShape(this.currentShapeId!).subscribe({
            next: (shape) => {
                this.patchForm(shape);
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des données de la forme:", err);
                this.router.navigate(['/admin/shapes']); 
            }
        });
    }

    patchForm(shape: Shape): void {
         this.shapeForm.patchValue({
             name: shape.name,
             slug: shape.slug,
             description: shape.description,
             image_url: shape.image_url,
             is_active: shape.is_active,
         });
    }

    onSubmit(): void {
        if (this.shapeForm.invalid) {
            this.shapeForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        const data = this.shapeForm.value;
        
        // Choisir entre création et mise à jour
        const request = this.isEditMode && this.currentShapeId
            ? this.shapeService.updateShape(this.currentShapeId, data)
            : this.shapeService.createShape(data);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/admin/shapes']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422 && err.error.errors) {
                    this.apiErrors = err.error.errors;
                } else {
                    this.apiErrors = { general: "Une erreur inattendue est survenue lors de la sauvegarde." };
                }
                console.error("Erreur API:", err);
            }
        });
    }
    
    // Méthode utilitaire pour générer le slug automatiquement
    onNameChange(): void {
        if (!this.isEditMode) {
            const name = this.shapeForm.get('name')?.value;
            if (name) {
                const slug = name.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères non alphanumériques, espaces et tirets
                    .trim()
                    .replace(/\s+/g, '-'); // Remplacer les espaces par des tirets
                this.shapeForm.get('slug')?.setValue(slug);
            }
        }
    }
}