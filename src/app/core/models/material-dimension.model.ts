// src/app/core/models/material-dimension.model.ts

// Les imports sont directs car les fichiers sont dans le même répertoire 'core/models/'
import { Material } from './material.model'; 
import { Shape } from './shape.model';

/**
 * Interface représentant une entrée de prix spécifique dans le catalogue.
 */
export interface MaterialDimension {
    id: number; 
    material_id: number; 
    shape_id: number; 
    category_id: number; 
    
    dimension_label: string; 
    unit_price_fcfa: number; 
    is_active: boolean;
    
    created_at: string;
    updated_at: string;

    // Relations enrichies
    material?: Material; 
    shape?: Shape; 
}