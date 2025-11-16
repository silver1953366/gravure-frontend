import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour le modèle de données reçu de l'API Laravel
interface QuoteData {
  id: number;
  name: string;
  material: string;
  // Ajoutez ici toutes les propriétés de votre modèle Quote nécessaires pour l'affichage
}

export interface FavoriteItem {
  id: number;
  user_id: number;
  quote_id: number;
  created_at: string;
  updated_at: string;
  quote: {
    id: number;
    reference: string; // Utilisé pour l'affichage dans le dashboard
    name: string;
    material: string;
    image_url: string; // URL de l'image du produit
  };
  // Propriété ajoutée pour simplifier le template
  image?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = 'api/favorites'; // Chemin à vérifier avec votre configuration Laravel

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste des favoris de l'utilisateur authentifié.
   * @returns Observable<FavoriteItem[]>
   */
  getFavorites(): Observable<FavoriteItem[]> {
    return this.http.get<FavoriteItem[]>(this.apiUrl);
  }

  /**
   * Ajoute un devis aux favoris en utilisant son ID.
   */
  addFavorite(quoteId: number): Observable<FavoriteItem> {
    return this.http.post<FavoriteItem>(this.apiUrl, { quote_id: quoteId });
  }

  /**
   * Supprime un favori spécifique.
   */
  removeFavorite(favoriteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${favoriteId}`);
  }
}