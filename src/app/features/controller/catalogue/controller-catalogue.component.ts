// src/app/features/controller/catalogue/controller-catalogue.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ControllerCatalogueService, Product } from './controller-catalogue.service';

@Component({
  selector: 'app-controller-catalogue',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './controller-catalogue.component.html',
  styleUrls: ['./controller-catalogue.component.css']
})
export class ControllerCatalogueComponent implements OnInit {

    products: Product[] = [];
    isLoading = true;
    error: string | null = null;
    
    constructor(
        private catalogueService: ControllerCatalogueService
    ) { }

    ngOnInit(): void {
        this.fetchProducts();
    }

    fetchProducts(): void {
        this.isLoading = true;
        this.catalogueService.getProducts().subscribe({
            next: (data) => {
                this.products = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement du catalogue", err);
                this.error = "Impossible de charger la liste des produits du catalogue.";
                this.isLoading = false;
            }
        });
    }

    // Le Controller peut naviguer vers les détails pour voir les specs
    goToProductDetail(id: number): void {
        // Supposons une route de détail: /controller/catalogue/:id
        // Si vous n'avez pas de composant de détail séparé, vous pouvez afficher l'info ici.
        // Pour l'instant, restons sur la liste.
        console.log(`Détails du produit #${id}`);
    }
}