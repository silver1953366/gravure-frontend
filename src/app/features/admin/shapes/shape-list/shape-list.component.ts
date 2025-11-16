import { Component, OnInit } from '@angular/core';
import { ShapeService, Shape } from '../shape.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule], 
    selector: 'app-shape-list',
    templateUrl: './shape-list.component.html',
    styleUrls: ['./shape-list.component.css']
})
export class ShapeListComponent implements OnInit {
    shapes: Shape[] = [];
    isLoading = true;
    error: any = null;
    // Pas de vérification de rôle ici, car le composant est dans le domaine Admin

    constructor(
      private shapeService: ShapeService,
      private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchShapes();
    }

    fetchShapes(): void {
        this.isLoading = true;
        this.error = null;
        this.shapeService.getShapes().subscribe({
            next: (data) => {
                this.shapes = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des formes", err);
                this.error = 'Impossible de charger la liste des formes. Accès Admin requis.';
                this.isLoading = false;
            }
        });
    }

    onDeleteShape(shapeId: number): void {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette forme ?")) {
            this.shapeService.deleteShape(shapeId).subscribe({
                next: () => {
                    this.shapes = this.shapes.filter(s => s.id !== shapeId);
                    console.log(`Forme ${shapeId} supprimée.`);
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression de la forme.");
                }
            });
        }
    }

    onEditShape(shapeId: number): void {
        this.router.navigate(['/admin/shapes/edit', shapeId]);
    }
    
    onCreateShape(): void {
        this.router.navigate(['/admin/shapes/create']);
    }
}