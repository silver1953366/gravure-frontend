import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Nécessaire pour [(ngModel)]

// Interface optionnelle pour typer les données
interface FilterItem {
  name: string;
  selected: boolean;
  count?: number; // 'count' est ajouté ici pour corriger l'erreur 'Property count does not exist'
}

@Component({
  selector: 'app-sidebar', // Le sélecteur original pour le Catalogue
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit { 
    // PROPRIÉTÉS DE CONTRÔLE
    @Input() isOpen: boolean = false;
    @Output() closeSidebar = new EventEmitter<void>();

    // PROPRIÉTÉS POUR LES FILTRES
    public materials: FilterItem[] = [
        { name: 'Acier', selected: false, count: 42 }, 
        { name: 'Cuivre', selected: false, count: 18 },
        { name: 'Aluminium', selected: false, count: 35 },
        { name: 'Plastique', selected: false, count: 8 }
    ];

    public shapes: FilterItem[] = [
        { name: 'Cercle', selected: false },
        { name: 'Carré', selected: false },
        { name: 'Triangle', selected: false }
    ];
    
    public minPrice: number = 0;
    public maxPrice: number = 5000;
    
    ngOnInit(): void {
        // Logique d'initialisation (ex: charger les filtres depuis l'API)
    }
    
    public applyFilters(): void {
        console.log('Filtres appliqués.');
        // Logique pour notifier le CatalogListComponent de rafraîchir les produits
    }

    public resetFilters(): void {
        this.minPrice = 0;
        this.maxPrice = 5000;
        this.materials.forEach(m => m.selected = false);
        this.shapes.forEach(s => s.selected = false);
        this.applyFilters();
    }
}