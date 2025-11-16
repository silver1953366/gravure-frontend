import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../category.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
    error: any = null;

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
        this.categoryService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des catégories", err);
                this.error = 'Impossible de charger la liste des catégories. Accès Admin requis.';
                this.isLoading = false;
            }
        });
    }

    onDeleteCategory(categoryId: number): void {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
            this.categoryService.deleteCategory(categoryId).subscribe({
                next: () => {
                    this.categories = this.categories.filter(c => c.id !== categoryId);
                    console.log(`Catégorie ${categoryId} supprimée.`);
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression de la catégorie.");
                }
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