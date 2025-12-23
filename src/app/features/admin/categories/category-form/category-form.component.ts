import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CategoryService } from '../category.service';

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
    isSlugLocked = true; // Pour verrouiller/déverrouiller le slug manuellement
    apiErrors: any = {};
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private categoryService: CategoryService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.categoryForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            slug: ['', [
                Validators.required, 
                Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) // Format url-propre-uniquement
            ]], 
            description: ['', [Validators.maxLength(500)]],
            is_active: [true],
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentCategoryId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentCategoryId;
            
            if (this.isEditMode) {
                this.loadCategoryData();
            } else {
                this.isSlugLocked = false; // En création, on laisse le slug libre
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
    }

    loadCategoryData(): void {
        this.isLoading = true;
        this.categoryService.getCategory(this.currentCategoryId!).pipe(take(1)).subscribe({
            next: (category) => {
                this.categoryForm.patchValue(category);
                this.isLoading = false;
            },
            error: () => this.router.navigate(['/admin/categories'])
        });
    }

    /**
     * Déclenché à chaque saisie du nom.
     * Génère le slug automatiquement si on n'est pas en mode édition verrouillé.
     */
    onNameChange(): void {
        if (!this.isEditMode || !this.isSlugLocked) {
            const nameValue = this.categoryForm.get('name')?.value;
            if (nameValue) {
                this.categoryForm.get('slug')?.setValue(this.slugify(nameValue));
            }
        }
    }

    /**
     * Transforme une chaîne en slug propre (ex: "Acier & Fer !" -> "acier-fer")
     */
    private slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD') // Sépare les accents des lettres
            .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
            .replace(/\s+/g, '-') // Remplace espaces par -
            .replace(/[^\w\-]+/g, '') // Supprime tout ce qui n'est pas mot ou tiret
            .replace(/\-\-+/g, '-') // Remplace doubles tirets par un seul
            .replace(/^-+/, '') // Supprime tiret au début
            .replace(/-+$/, ''); // Supprime tiret à la fin
    }

    toggleSlugLock(): void {
        this.isSlugLocked = !this.isSlugLocked;
    }

    onSubmit(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        
        const request = this.isEditMode 
            ? this.categoryService.updateCategory(this.currentCategoryId!, this.categoryForm.value)
            : this.categoryService.createCategory(this.categoryForm.value);

        request.pipe(take(1)).subscribe({
            next: () => this.router.navigate(['/admin/categories']),
            error: (err) => {
                this.isLoading = false;
                this.apiErrors = err.status === 422 ? err.error.errors : { general: "Erreur serveur" };
            }
        });
    }
}