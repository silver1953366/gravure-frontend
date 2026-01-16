import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// --- CORRECTION DES IMPORTS ---
// On remonte de 3 niveaux : materials (1) -> admin (2) -> features (3) -> app/core...
import { Category } from '../../../../core/models/category.model';
import { Material } from '../../../../core/models/material.model';

// Imports de vos services
import { MaterialService } from '../material.service';
import { CatalogService } from '../../../../core/services/catalog/catalog.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule], 
    selector: 'app-material-form',
    templateUrl: './material-form.component.html',
    styleUrls: ['./material-form.component.css']
})
export class MaterialFormComponent implements OnInit, OnDestroy {
    
    private fb = inject(FormBuilder);
    private materialService = inject(MaterialService);
    private catalogService = inject(CatalogService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    materialForm: FormGroup;
    currentMaterialId: number | null = null;
    isEditMode = false;
    isLoading = false;
    
    categories: Category[] = []; 
    apiErrors: any = {};
    
    selectedFile: File | null = null;
    imageUrlPreview: string | ArrayBuffer | null = null; 
    
    private routeSubscription!: Subscription;

    constructor() {
        this.materialForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            slug: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]], 
            category_id: [null],
            description: [''],
            price_per_sq_meter: [null, [Validators.min(0)]], 
            thickness_options: [''], 
            is_active: [true],
            image_url: [''] 
        });
    }

    ngOnInit(): void {
        this.loadCategories();

        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentMaterialId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentMaterialId;
            
            if (this.isEditMode) {
                this.loadMaterialData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
    }

    loadCategories(): void {
        this.catalogService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
            },
            error: (err) => console.error('Erreur catégories', err)
        });
    }

    loadMaterialData(): void {
        this.isLoading = true;
        this.materialService.getMaterial(this.currentMaterialId!).subscribe({
            next: (material: Material) => { // Type explicite ici
                this.patchForm(material);
                this.isLoading = false;
            },
            error: (err) => {
                this.router.navigate(['/admin/materials']); 
            }
        });
    }

    patchForm(material: Material): void {
        this.materialForm.patchValue({
            name: material.name,
            slug: material.slug,
            category_id: material.category_id,
            description: material.description,
            price_per_sq_meter: material.price_per_sq_meter,
            thickness_options: material.thickness_options,
            is_active: material.is_active,
            image_url: material.image_url || ''
        });
        this.imageUrlPreview = material.image_url || null;
    }

    // ... Garder les méthodes onFileSelected, onNameChange et onSubmit identiques
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = e => this.imageUrlPreview = reader.result;
            reader.readAsDataURL(this.selectedFile!);
        }
    }

    onNameChange(): void {
        if (!this.isEditMode) {
            const name = this.materialForm.get('name')?.value;
            if (name) {
                const slug = name.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
                this.materialForm.get('slug')?.setValue(slug, { emitEvent: false });
            }
        }
    }

    onSubmit(): void {
        if (this.materialForm.invalid) {
            this.materialForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        
        const formData = new FormData();
        const rawData = this.materialForm.getRawValue();
        
        Object.keys(rawData).forEach(key => {
            if (key !== 'image_url') { 
                let value = rawData[key];
                if (key === 'is_active') value = value ? '1' : '0';
                formData.append(key, (value !== null && value !== undefined) ? value : '');
            }
        });
        
        if (this.selectedFile) {
            formData.append('image', this.selectedFile, this.selectedFile.name);
        }

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
                if (err.status === 422) {
                    this.apiErrors = err.error.errors;
                } else {
                    this.apiErrors = { general: "Une erreur inattendue est survenue." };
                }
            }
        });
    }
}