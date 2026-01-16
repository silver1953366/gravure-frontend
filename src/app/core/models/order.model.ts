import { Attachment } from './client/quotes/attachment.model'; 
import { Quote } from './client/quotes/quote.model'; 
import { Material } from './material.model';          
import { Shape } from './shape.model';                
import { MaterialDimension } from './material-dimension.model';

/**
 * Interface pour l'adresse de livraison (Snapshot JSON dans la DB)
 */
export interface Address {
    street: string;
    city: string;
    postal_code: string;
    country?: string; 
}

/**
 * Interface pour les détails du client (Snapshot JSON dans la DB)
 */
export interface ClientDetails {
    name?: string;
    email?: string;
    phone?: string;
    work_name?: string; // Correspond au commentaire dans votre migration
}

/**
 * Interface pour la configuration technique (Snapshot JSON dans la DB)
 */
export interface DetailsSnapshot {
    description?: string;
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
    options?: any;
}

/**
 * Interface principale Order
 * Reflète la structure de la table 'orders' de votre migration Laravel
 */
export interface Order {
    id: number;
    reference: string; 
    user_id: number;
    quote_id: number;
    
    // Transaction
    payment_id: string | null; 
    final_price_fcfa: number; // Note: 'decimal' dans Laravel -> 'number' en TS
    quantity: number; 
    
    // Snapshots (JSON ou ID)
    material_id: number;
    shape_id: number;
    material_dimension_id: number | null;
    client_details: ClientDetails | null; 
    details_snapshot: DetailsSnapshot | null; 
    shipping_address: Address; 
    
    // Statuts (Enum)
    status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'completed' | 'canceled';
    
    // Timestamps
    completed_at: string | Date | null; // Reçu comme string ISO depuis Laravel
    created_at: string | Date;
    updated_at: string | Date;
    
    // Relations (chargées via with() dans le contrôleur)
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    quote?: Quote;
    material?: Material;
    shape?: Shape;
    material_dimension?: MaterialDimension; 
    attachments?: Attachment[]; 
}