import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FavoriteItem } from '../models/favorite.model'; // Import de la nouvelle interface
import { environment } from '../../environments/environment'; // Ajustez le chemin si nécessaire


@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  
  private http = inject(HttpClient);
  // Assurez-vous que l'URL de base de l'API est correcte
  private apiUrl = `${environment.apiUrl}/favorites`; 

  /**
   * Récupère la liste des favoris de l'utilisateur.
   * La réponse de l'API correspond à FavoriteItem[] (y compris la relation 'quote').
   */
  getFavorites(): Observable<FavoriteItem[]> {
    return this.http.get<FavoriteItem[]>(this.apiUrl).pipe(
      // Optionnel: Ajouter une logique de transformation ou de tri ici
      map(favorites => favorites.map(fav => ({
        ...fav,
        // Ajouter un champ 'image' par défaut si nécessaire pour le template
        image: fav.quote.image_url || `https://placehold.co/160x120/4B5563/FFFFFF?text=${fav.quote.reference}`
      })))
    );
  }

  /**
   * Ajoute un devis aux favoris.
   */
  addFavorite(quoteId: number): Observable<FavoriteItem> {
    return this.http.post<FavoriteItem>(this.apiUrl, { quote_id: quoteId });
  }

  /**
   * Supprime un favori.
   */
  removeFavorite(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`);
  }
}