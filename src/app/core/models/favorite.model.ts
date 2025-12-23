// src/app/features/client/favorites/favorite.model.ts

/**
 * Interface représentant les détails d'un devis lié à un favori.
 */
export interface QuoteDetails {
    // Correspond aux champs du modèle Quote
    id: number;
    reference: string;
    name: string;
    material: string;
    image_url?: string; // Optionnel
    // Ajoutez ici tous les autres champs de votre modèle Quote nécessaires pour l'affichage
}

/**
 * Interface représentant l'objet Favori tel que retourné par l'API (avec la relation quote).
 */
export interface FavoriteItem {
    // Correspond aux champs du modèle Favorite (réponse API)
    id: number; // ID du favori lui-même
    user_id: number;
    quote_id: number;
    
    // Relation chargée via Laravel (->with('quote'))
    quote: QuoteDetails; 
    
    // Champ local ajouté par le service pour l'affichage (image générée ou par défaut)
    image?: string;
}