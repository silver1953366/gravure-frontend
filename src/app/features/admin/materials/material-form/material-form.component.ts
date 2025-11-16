import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MaterialService, Material } from '../material.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule], 
    selector: 'app-material-form',
    templateUrl: './material-form.component.html',
    styleUrls: ['./material-form.component.css']
})
export class MaterialFormComponent implements OnInit, OnDestroy {
    
    materialForm: FormGroup;
    currentMaterialId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    selectedFile: File | null = null;
    imageUrlPreview: string | ArrayBuffer | null = null; // Pour afficher l'image avant l'upload
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private materialService: MaterialService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.materialForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            slug: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]], 
            description: [''],
            // Le champ image_url est conservé pour stocker l'URL reçue du backend en mode édition
            image_url: [''], 
            price_per_sq_meter: [0, [Validators.required, Validators.min(0.01)]], 
            thickness_options: [''], 
            is_active: [true],
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentMaterialId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentMaterialId;
            
            if (this.isEditMode) {
                this.loadMaterialData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    loadMaterialData(): void {
        this.isLoading = true;
        this.materialService.getMaterial(this.currentMaterialId!).subscribe({
            next: (material) => {
                this.patchForm(material);
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des données du matériau:", err);
                this.router.navigate(['/admin/materials']); 
            }
        });
    }

    patchForm(material: Material): void {
         this.materialForm.patchValue({
             name: material.name,
             slug: material.slug,
             description: material.description,
             price_per_sq_meter: material.price_per_sq_meter,
             thickness_options: material.thickness_options,
             is_active: material.is_active,
             image_url: material.image_url || '', // Conserver l'URL existante
         });
         this.imageUrlPreview = material.image_url || null; // Afficher l'image existante
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            
            // Prévisualisation de l'image
            const reader = new FileReader();
            reader.onload = e => this.imageUrlPreview = reader.result;
            reader.readAsDataURL(this.selectedFile!);

        } else {
            this.selectedFile = null;
            // Si l'utilisateur annule la sélection, revenir à l'image existante si elle y est
            this.imageUrlPreview = this.materialForm.get('image_url')?.value || null;
        }
    }

    onSubmit(): void {
        if (this.materialForm.invalid) {
            this.materialForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        
        // 1. Construire l'objet FormData
        const formData = new FormData();
        const rawData = this.materialForm.getRawValue(); // Utiliser getRawValue pour récupérer les valeurs
        
        // Ajouter tous les champs textuels
        Object.keys(rawData).forEach(key => {
            // Exclure le champ image_url car il est géré par l'upload
            if (key !== 'image_url') { 
                formData.append(key, rawData[key] !== null ? rawData[key] : '');
            }
        });
        
        // 2. Ajouter le fichier (si présent)
        if (this.selectedFile) {
            // 'image' doit correspondre au nom de champ attendu par votre API Laravel pour l'upload
            formData.append('image', this.selectedFile, this.selectedFile.name);
        }

        // 3. Choisir entre création et mise à jour
        const request = this.isEditMode && this.currentMaterialId
            ? this.materialService.updateMaterial(this.currentMaterialId, formData)
            : this.materialService.createMaterial(formData);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/admin/materials']);
            },
            error: (err) => {
                this.isLoading = false;
                // La clé d'erreur pour le fichier est généralement 'image' dans Laravel
                if (err.status === 422 && err.error.errors) {
                    this.apiErrors = err.error.errors;
                } else {
                    this.apiErrors = { general: "Une erreur inattendue est survenue lors de la sauvegarde." };
                }
                console.error("Erreur API:", err);
            }
        });
    }
    
    onNameChange(): void {
        if (!this.isEditMode) {
            const name = this.materialForm.get('name')?.value;
            if (name) {
                const slug = name.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
                this.materialForm.get('slug')?.setValue(slug);
            }
        }
    }
}