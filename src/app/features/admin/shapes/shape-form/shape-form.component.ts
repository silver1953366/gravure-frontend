/* src/app/features/admin/forme/shape-form/shape-form.component.ts */
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShapeService } from '../shape.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    selector: 'app-shape-form',
    templateUrl: './shape-form.component.html',
    styleUrls: ['./shape-form.component.css']
})
export class ShapeFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    public router = inject(Router);
    private shapeService = inject(ShapeService);

    shapeForm!: FormGroup;
    shapeId: number | null = null;
    isEditMode = false;
    isLoading = false;
    isSlugLocked = true; // État du verrouillage du slug
    error: string | null = null;
    
    selectedFile: File | null = null;
    previewUrl: string | null = null; // Pour voir l'image avant l'envoi
    currentImageUrl: string | null = null;

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    initializeForm(): void {
        this.shapeForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
            description: [''],
            is_active: [true]
        });

        // Génération auto du slug si on n'est pas en mode édition ou si déverrouillé
        this.shapeForm.get('name')?.valueChanges.subscribe(name => {
            if (this.isSlugLocked && !this.isEditMode) {
                this.generateSlug(name);
            }
        });
    }

    private checkEditMode(): void {
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    this.shapeId = +id;
                    this.isEditMode = true;
                    this.isLoading = true;
                    return this.shapeService.getShape(this.shapeId);
                }
                return of(null);
            })
        ).subscribe({
            next: (shape) => {
                if (shape) {
                    this.shapeForm.patchValue(shape);
                    this.currentImageUrl = shape.image_url || null;
                    this.shapeForm.get('slug')?.disable(); // Désactivé par défaut en edit
                }
                this.isLoading = false;
            },
            error: () => {
                this.error = "Erreur lors du chargement de la forme.";
                this.isLoading = false;
            }
        });
    }

    generateSlug(name: string): void {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        this.shapeForm.get('slug')?.patchValue(slug);
    }

    toggleSlugLock(): void {
        this.isSlugLocked = !this.isSlugLocked;
        const slugControl = this.shapeForm.get('slug');
        if (this.isSlugLocked) {
            slugControl?.disable();
        } else {
            slugControl?.enable();
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.selectedFile = input.files[0];
            
            // Créer une prévisualisation locale
            const reader = new FileReader();
            reader.onload = () => this.previewUrl = reader.result as string;
            reader.readAsDataURL(this.selectedFile);
        }
    }

    onSubmit(): void {
        if (this.shapeForm.invalid) {
            this.shapeForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const formValue = this.shapeForm.getRawValue();
        const formData = new FormData();
        
        Object.keys(formValue).forEach(key => {
            if (key === 'is_active') {
                formData.append(key, formValue[key] ? '1' : '0');
            } else {
                formData.append(key, formValue[key] || '');
            }
        });

        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }
        
        if (this.isEditMode) {
            formData.append('_method', 'PUT');
        }

        const action = this.isEditMode
            ? this.shapeService.updateShape(this.shapeId!, formData)
            : this.shapeService.createShape(formData);

        action.subscribe({
            next: () => this.router.navigate(['/admin/shapes']),
            error: (err) => {
                this.error = "Erreur lors de l'enregistrement.";
                this.isLoading = false;
            }
        });
    }
}