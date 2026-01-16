import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importer le service et le modèle depuis le core
import { FavoriteItem, QuoteDetails } from '../../../core/models/favorite.model';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true, // Utilisation de standalone
  imports: [
    CommonModule, 
    RouterLink, 
    //DatePipe // Ajout pour un affichage futur si l'objet QuoteDetails est étendu
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {

  private favoritesService = inject(FavoritesService);

  // Signals pour gérer l'état
  favorites = signal<FavoriteItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * Charge la liste des devis mis en favoris par l'utilisateur.
   */
  loadFavorites(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.favoritesService.getFavorites().subscribe({
      next: (data) => {
        this.favorites.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des favoris:', err);
        this.error.set("Impossible de charger votre liste de favoris.");
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Supprime un favori et met à jour la liste locale.
   */
  removeFavorite(favoriteId: number): void {
    if (!confirm("Voulez-vous vraiment retirer ce devis de vos favoris ?")) {
      return;
    }

    this.favoritesService.removeFavorite(favoriteId).subscribe({
      next: () => {
        // Mise à jour de la liste sans recharger la page
        this.favorites.update(items => items.filter(item => item.id !== favoriteId));
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du favori:', err);
        this.error.set("Échec de la suppression. Veuillez réessayer.");
      }
    });
  }
}