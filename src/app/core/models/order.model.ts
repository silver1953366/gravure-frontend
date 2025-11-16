// src/app/core/models/order.model.ts

// NOTE: Le chemin vers Attachment doit être ajusté si votre structure de dossier est différente.
import { Attachment } from './client/quotes/attachment.model'; 
import { Quote } from './client/quotes/quote.model'; 
import { Material } from './material.model';          
import { Shape } from './shape.model';                
import { MaterialDimension } from './material-dimension.model'

// CORRECTION: Ajout de l'export
export interface Address {
    street: string;
    city: string;
    postal_code: string;
    country: string; // Ajouté car utilisé dans le composant de détail du devis
}

export interface ClientDetails {
    name: string;
    email: string;
    phone: string;
}

export interface DetailsSnapshot {
    description?: string; 
}

// CORRECTION: Ajout de l'export
export interface Order {
    id: number;
    user_id: number;
    quote_id: number;
    reference: string; 
    payment_id: string | null; 
    
    final_price_fcfa: number; 
    quantity: number; 
    
    status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'completed' | 'canceled';
    
    shipping_address: Address; 
    client_details: ClientDetails; 
    details_snapshot: DetailsSnapshot; 
    
    material_id: number;
    shape_id: number;
    material_dimension_id: number;

    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
    
    quote?: Quote;
    material?: Material;
    shape?: Shape;
    material_dimension?: MaterialDimension; 
    attachments?: Attachment[]; 
}