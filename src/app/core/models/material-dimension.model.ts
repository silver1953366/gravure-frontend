import { Material } from './material.model';
import { Shape } from './shape.model';

export interface MaterialDimension {
    id: number;
    material_id: number;
    shape_id: number;
    
    dimension_label: string; 
    unit_price_fcfa: number; // CORRECTION: Nom de propriété NÉCESSAIRE pour PriceDisplayComponent et DimensionSelectorComponent
    is_active: boolean;
    
    created_at: string;
    updated_at: string;

    material: Material; 
    shape: Shape;       
}