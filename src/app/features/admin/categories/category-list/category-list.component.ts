import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../category.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule], 
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
    categories: Category[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
      private categoryService: CategoryService,
      private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchCategories();
    }

    fetchCategories(): void {
        this.isLoading = true;
        this.error = null;
        this.categoryService.getCategories().pipe(take(1)).subscribe({
            next: (data) => {
                // Tri par défaut : les plus récentes en premier (par ID)
                this.categories = data.sort((a, b) => b.id - a.id);
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Impossible de charger les catégories. Vérifiez votre connexion admin.';
                this.isLoading = false;
            }
        });
    }

    onDeleteCategory(category: Category): void {
        const confirmMsg = `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ? 
        Cela pourrait affecter les produits associés.`;
        
        if (confirm(confirmMsg)) {
            this.categoryService.deleteCategory(category.id).pipe(take(1)).subscribe({
                next: () => {
                    this.categories = this.categories.filter(c => c.id !== category.id);
                },
                error: () => alert("Erreur : Impossible de supprimer une catégorie liée à des produits.")
            });
        }
    }

    onEditCategory(categoryId: number): void {
        this.router.navigate(['/admin/categories/edit', categoryId]);
    }
    
    onCreateCategory(): void {
        this.router.navigate(['/admin/categories/create']);
    }
}