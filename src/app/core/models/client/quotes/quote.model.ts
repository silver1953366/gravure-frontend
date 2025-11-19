import { Attachment } from './attachment.model'; 

// --- Définitions d'Interfaces ---

export type QuoteStatus = 'draft' | 'sent' | 'calculated' | 'ordered' | 'rejected' | 'archived';

export interface UserInfo { 
    id: number; 
    name: string; 
    email: string; 
    address?: string; 
}

export interface QuoteItem {
    id?: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
}

export interface OrderItem {
    id?: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
    quote_item_id?: number; 
}

export interface Order {
    id: number;
    user_id: number;
    user?: UserInfo;
    quote_id: number;
    status: 'pending_payment' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';
    total_price: number;
    created_at: Date;
    items: OrderItem[];
}

export interface MaterialDimension {
    dimension_label: string; 
    // ...
}
export interface Material { /* ... */ }
export interface Shape { /* ... */ }

export interface Quote {
    id: number;
    user_id: number;
    reference: string;
    client_ref?: string | null; 
    
    status: QuoteStatus; 
    
    // PRIX FINAL RÉEL DANS LE MODÈLE (Utilisé dans les templates)
    final_price_fcfa: number; 
    base_price_fcfa: number;
    discount_amount_fcfa: number;
    
    quantity: number; 
    order_id: number | null;
    
    material_id: number;
    shape_id: number;
    material_dimension_id: number;
    details_snapshot: {
        description?: string;
    };
    
    created_at: Date;
    updated_at: Date;

    material?: Material; 
    shape?: Shape; 
    materialDimension?: MaterialDimension; 
    attachments?: Attachment[]; 
    
    // CORRECTION APPLIQUÉE ICI
    user?: UserInfo; 
    items: QuoteItem[];
}

export interface QuotePayload {
    // Définition de la charge utile de création/mise à jour d'un devis
}

export interface QuoteEstimate {
    // Définition de la réponse d'estimation de prix
}