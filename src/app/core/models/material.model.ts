import { Category } from './category.model';

export interface Material {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  price_per_sq_meter?: number | null; // Optionnel
  thickness_options?: string;
  color?: string;
  is_active: boolean;
  category_id: number; // <--- Vérifiez bien l'orthographe exacte ici
  
  // Relation chargée par le backend (eager loading)
  category?: Category;
  
  created_at?: string;
  updated_at?: string;
}