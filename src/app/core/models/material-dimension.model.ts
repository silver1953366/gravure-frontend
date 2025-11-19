import { Material } from './material.model';
import { Shape } from './shape.model';

/**
 * Interface représentant une entrée de prix spécifique dans le catalogue.
 * Les dimensions physiques (width, height, thickness) sont gérées par dimension_label.
 */
export interface MaterialDimension {
    id: number;
    material_id: number;
    shape_id: number;
    category_id: number; 
    
    dimension_label: string; // Ex: '100x50mm Ép.2'
    unit_price_fcfa: number; 
    is_active: boolean;
    
    created_at: string;
    updated_at: string;

    // Relations enrichies
    material?: Material; 
    shape?: Shape; 
}