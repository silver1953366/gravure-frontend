import { Component, OnInit } from '@angular/core';
import { MaterialService, Material } from '../material.service';
import { CommonModule, CurrencyPipe } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, CurrencyPipe], 
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
        // Déclenche l'appel HTTP réel vers le backend
        this.fetchMaterials();
    }

    fetchMaterials(): void {
        this.isLoading = true;
        this.error = null;
        
        // S'abonne à l'Observable qui fait la requête HTTP réelle
        this.materialService.getMaterials().subscribe({
            next: (data) => {
                // 'data' est la liste des matériaux retournée par votre API
                this.materials = data.sort((a, b) => b.id - a.id); 
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des matériaux", err);
                this.error = 'Impossible de charger la liste des matériaux. Veuillez vérifier la connexion au backend.';
                this.isLoading = false;
            }
        });
    }

    onDeleteMaterial(materialId: number): void {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce matériau ?")) {
             // Appel au service qui fait la requête HTTP DELETE
            this.materialService.deleteMaterial(materialId).subscribe({
                next: () => {
                    // Supprime l'élément localement après confirmation par l'API
                    this.materials = this.materials.filter(m => m.id !== materialId);
                    console.log(`Matériau ${materialId} supprimé.`);
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression du matériau: Vérifiez les logs du backend.");
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