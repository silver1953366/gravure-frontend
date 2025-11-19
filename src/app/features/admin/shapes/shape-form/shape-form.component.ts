import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShapeService, Shape } from '../shape.service';
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
    // Rendre 'router' PUBLIC pour l'accès dans le template HTML
    public router = inject(Router); 
    private shapeService = inject(ShapeService);

    shapeForm!: FormGroup;
    shapeId: number | null = null;
    isEditMode = false;
    isLoading = false;
    error: string | null = null;
    
    selectedFile: File | null = null; 
    currentImageUrl: string | null = null; 

    ngOnInit(): void {
        this.initializeForm();
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
                    // Rendre le slug non modifiable après la création
                    this.shapeForm.get('slug')?.disable(); 
                    this.currentImageUrl = shape.image_url || null;
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.error = "Erreur lors du chargement de la forme.";
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    initializeForm(): void {
        this.shapeForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            // Le slug est requis uniquement à la création
            slug: ['', this.isEditMode ? [] : [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]], 
            description: [''],
            is_active: [true]
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        } else {
            this.selectedFile = null;
        }
    }

    onSubmit(): void {
        if (this.shapeForm.invalid) {
            this.shapeForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.error = null;
        
        // Récupérer TOUTES les valeurs, y compris le 'slug' désactivé.
        const formValue = this.shapeForm.getRawValue();

        const formData = new FormData();
        
        // 🚀 FIX: Ajouter toutes les données du formulaire, en s'assurant que les valeurs sont des chaînes (y compris les booléens et les champs vides)
        Object.keys(formValue).forEach(key => {
            const value = formValue[key];

            if (typeof value === 'boolean') {
                // Pour les booléens, utiliser '1' ou '0' pour les API REST robustes
                formData.append(key, value ? '1' : '0'); 
            } else if (value !== null && value !== undefined) {
                // Pour les autres valeurs, utiliser la valeur elle-même
                formData.append(key, value);
            } else {
                // Pour les champs nulls ou non définis (comme la description si laissée vide), envoyer une chaîne vide
                formData.append(key, ''); 
            }
        });

        // Ajouter le fichier sélectionné
        if (this.selectedFile) {
            // Assurez-vous que 'image' est le nom du champ attendu par votre backend
            formData.append('image', this.selectedFile, this.selectedFile.name);
        }
        
        // Si c'est une mise à jour, ajouter la méthode PUT pour le backend
        if (this.isEditMode) {
            formData.append('_method', 'PUT'); 
        }

        const action = this.isEditMode
            ? this.shapeService.updateShape(this.shapeId!, formData)
            : this.shapeService.createShape(formData);

        action.subscribe({
            next: () => {
                // Utilisez une modale ou un toast au lieu d'alert() dans une application réelle
                alert(`Forme ${this.isEditMode ? 'mise à jour' : 'créée'} avec succès.`);
                this.router.navigate(['/admin/shapes']); 
            },
            error: (err) => {
                this.error = this.isEditMode 
                    ? 'Erreur lors de la mise à jour de la forme.' 
                    : 'Erreur lors de la création de la forme.';
                this.isLoading = false;
                console.error(err);
                if (err.error && err.error.message) {
                    this.error += ' Détails: ' + err.error.message;
                }
            }
        });
    }
}