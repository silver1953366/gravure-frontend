import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import du service et du modèle
import { ShapeService, Shape } from '../shape.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  selector: 'app-shape-list',
  templateUrl: './shape-list.component.html',
  styleUrls: ['./shape-list.component.css']
})
export class ShapeListComponent implements OnInit {
  // --- Injections ---
  private shapeService = inject(ShapeService);
  protected router = inject(Router);

  // --- Données ---
  shapes: Shape[] = [];           // Source de vérité (API)

  // --- États UI ---
  isLoading = true;
  error: string | null = null;
  searchTerm: string = '';        // Lié au ngModel de recherche

  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 5;       // Nombre d'éléments par page

  ngOnInit(): void {
    this.fetchShapes();
  }

  /**
   * Récupère la liste brute des formes depuis le backend
   */
  fetchShapes(): void {
    this.isLoading = true;
    this.error = null;

    this.shapeService.getShapes().subscribe({
      next: (data) => {
        // Tri décroissant pour afficher les dernières créations en premier
        this.shapes = data.sort((a, b) => b.id - a.id);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur API Shapes:", err);
        this.error = 'Impossible de charger la liste des formes. Vérifiez la connexion au serveur.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Getter : Retourne la liste filtrée selon le terme de recherche
   * (Recherche sur le nom ou le slug)
   */
  get filteredShapes(): Shape[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.shapes;

    return this.shapes.filter(s => 
      s.name.toLowerCase().includes(term) || 
      (s.slug && s.slug.toLowerCase().includes(term))
    );
  }

  /**
   * Getter : Retourne uniquement les éléments de la page actuelle
   * Basé sur la liste déjà filtrée
   */
  get paginatedShapes(): Shape[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredShapes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Getter : Calcule le nombre total de pages
   */
  get totalPages(): number {
    const count = this.filteredShapes.length;
    return Math.ceil(count / this.itemsPerPage);
  }

  /**
   * Déclenché à chaque modification de la recherche
   */
  onFilterChange(): void {
    this.currentPage = 1; // On revient à la page 1 lors d'une recherche
  }

  /**
   * Navigation vers le formulaire de création
   */
  onCreateShape(): void {
    this.router.navigate(['/admin/shapes/create']);
  }

  /**
   * Navigation vers le formulaire d'édition
   */
  onEditShape(shapeId: number): void {
    this.router.navigate(['/admin/shapes/edit', shapeId]);
  }

  /**
   * Suppression d'une forme avec confirmation et gestion d'erreur 409
   */
  onDeleteShape(shape: Shape): void {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer la forme "${shape.name}" ?`;
    
    if (confirm(confirmMessage)) {
      this.shapeService.deleteShape(shape.id).subscribe({
        next: () => {
          // Mise à jour locale pour éviter un appel API coûteux
          this.shapes = this.shapes.filter(s => s.id !== shape.id);
          
          // Sécurité : si on supprime le dernier élément d'une page
          if (this.paginatedShapes.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: (err) => {
          console.error("Erreur suppression:", err);
          const msg = err.status === 409 
            ? "Impossible de supprimer cette forme car elle est liée à des tarifs ou devis."
            : "Une erreur est survenue lors de la suppression.";
          alert(msg);
        }
      });
    }
  }

  /**
   * Réinitialisation complète et rechargement
   */
  onRefresh(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.fetchShapes();
  }
}