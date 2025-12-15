// src/app/core/models/cart.model.ts

export interface Material {
    id: number;
    name: string;
}

export interface Shape {
    id: number;
    name: string;
    // ... autres champs de la forme
}

export interface MaterialDimension {
    id: number;
    unit_price_fcfa: number;
    // ... autres détails de dimension/forme (par exemple: width, height)
    material: Material;
    shape: Shape; 
}

export interface CartItem {
    id: number;
    cart_id: number;
    material_dimension_id: number;
    quantity: number;
    engraving_text: string | null;
    mounting_option: string | null;
    custom_options: string | null;
    fixed_unit_price_fcfa: number; // Prix unitaire (Base + Gravure) fixé
    
    // Relations chargées par le CartController
    materialDimension: MaterialDimension; 
}

export interface Discount {
    id: number;
    code: string;
    // ... autres champs de rabais
}

export interface Cart {
    id: number;
    user_id: number | null;
    
    // CORRECTION APPLIQUÉE : session_token doit être nullable pour être compatible 
    // avec l'état INITIAL_EMPTY_CART où il est null.
    session_token: string | null; 
    
    status: 'pending' | 'ordered' | 'converted';
    
    items: CartItem[];
    // La propriété 'discount' est bien typée comme pouvant être null
    discount: Discount | null; 
    
    // Propriétés calculées ajoutées pour assurer la compatibilité si vous les utilisez
    // dans INITIAL_EMPTY_CART ou si le backend les envoie.
    subtotal_ht: number; 
}

// Payload pour l'ajout/mise à jour d'un article
export interface CartItemPayload {
    material_dimension_id: number;
    quantity: number;
    engraving_text?: string | null;
    mounting_option?: string | null;
    custom_options?: string | null;
}