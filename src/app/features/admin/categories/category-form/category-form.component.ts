import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CategoryService, Category } from '../category.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule], 
    selector: 'app-category-form',
    templateUrl: './category-form.component.html',
    styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, OnDestroy {
    
    categoryForm: FormGroup;
    currentCategoryId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private categoryService: CategoryService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.categoryForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            slug: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]], 
            description: [''],
            is_active: [true],
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentCategoryId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentCategoryId;
            
            if (this.isEditMode) {
                this.loadCategoryData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    loadCategoryData(): void {
        this.isLoading = true;
        this.categoryService.getCategory(this.currentCategoryId!).subscribe({
            next: (category) => {
                this.categoryForm.patchValue(category);
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des données de la catégorie:", err);
                this.router.navigate(['/admin/categories']); 
            }
        });
    }

    onSubmit(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        const data = this.categoryForm.value;
        
        const request = this.isEditMode && this.currentCategoryId
            ? this.categoryService.updateCategory(this.currentCategoryId, data)
            : this.categoryService.createCategory(data);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/admin/categories']);
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
    
    // Logique pour générer le slug automatiquement
    onNameChange(): void {
        if (!this.isEditMode) {
            const name = this.categoryForm.get('name')?.value;
            if (name) {
                const slug = name.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
                this.categoryForm.get('slug')?.setValue(slug);
            }
        }
    }
}