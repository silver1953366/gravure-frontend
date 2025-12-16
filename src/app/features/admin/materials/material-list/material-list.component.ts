import { Component, OnInit } from '@angular/core';
import { MaterialService, Material } from '../material.service';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Import de CurrencyPipe
import { Router, RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, CurrencyPipe], // CurrencyPipe pour le formatage du prix
    selector: 'app-material-list',
    templateUrl: './material-list.component.html',
    styleUrls: ['./material-list.component.css']
})
export class MaterialListComponent implements OnInit {
    materials: Material[] = [];
    isLoading = true;
    error: any = null;

    constructor(
      private materialService: MaterialService,
      private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchMaterials();
    }

    fetchMaterials(): void {
        this.isLoading = true;
        this.error = null;
        this.materialService.getMaterials().subscribe({
            next: (data) => {
                // Tri par ID décroissant pour voir les derniers ajouts en premier
                this.materials = data.sort((a, b) => b.id - a.id); 
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des matériaux", err);
                this.error = 'Impossible de charger la liste des matériaux. Accès Admin requis.';
                this.isLoading = false;
            }
        });
    }

    onDeleteMaterial(materialId: number): void {
        // Remplacer confirm() par une modale personnalisée dans une application réelle
        if (confirm("Êtes-vous sûr de vouloir supprimer ce matériau ?")) {
            this.materialService.deleteMaterial(materialId).subscribe({
                next: () => {
                    this.materials = this.materials.filter(m => m.id !== materialId);
                    console.log(`Matériau ${materialId} supprimé.`);
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    // Remplacer alert() par une modale personnalisée
                    alert("Erreur lors de la suppression du matériau.");
                }
            });
        }
    }

    onEditMaterial(materialId: number): void {
        this.router.navigate(['/admin/materials/edit', materialId]);
    }
    
    onCreateMaterial(): void {
        this.router.navigate(['/admin/materials/create']);
    }
}