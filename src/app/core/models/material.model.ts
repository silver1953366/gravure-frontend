import { Category } from './category.model'; 

/**
 * Interface représentant un matériau utilisé pour la configuration de produits.
 * Basée sur les champs de la table 'materials'.
 */
export interface Material {
  id: number;
  name: string;
  category_id: number;
  color?: string; 
  image_url?: string; 
  description?: string;
  
  // Relation optionnelle 
  category?: Category; 
  
  created_at?: string;
  updated_at?: string;
}