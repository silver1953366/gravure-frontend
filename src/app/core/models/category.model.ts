export interface Material {
    id: number;
    name: string;
    description: string;
}

export interface Shape {
    id: number;
    name: string;
    description: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    image_url : string
    
}

// L'entrée principale de votre catalogue de prix
export interface MaterialDimension {
    id?: number; // Optionnel lors de la création
    material_id: number;
    shape_id: number;
    category_id: number;
    dimension_label: string;
    unit_price_fcfa: number;
    is_active: boolean;
    // Relations optionnelles pour l'affichage
    material?: Material;
    shape?: Shape;
    category?: Category;
    updated_at?: string;
}