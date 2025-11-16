// src/app/core/models/client/quotes/quote.model.ts

import { Attachment } from './attachment.model'; // <-- CORRECTION: Import de Attachment

// NOTE: Remplacer 'any' par vos interfaces Material, Shape, MaterialDimension si elles existent.

export interface Quote {
    id: number;
    user_id: number;
    reference: string;
    // Utilisation de snake_case basée sur le backend Laravel
    client_ref?: string | null; 
    status: 'draft' | 'sent' | 'calculated' | 'ordered' | 'rejected' | 'archived';
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

    material?: any; 
    shape?: any;     
    materialDimension?: {
        dimension_label: string; // Ajout/confirmation pour le correctif de la liste
        // ... autres propriétés
    }; 
    attachments?: Attachment[]; 
}

// CORRECTION: Ajout des exports pour résoudre les erreurs dans client-quote.service.ts
export interface QuotePayload {
    // Définition de la charge utile de création/mise à jour d'un devis
}

export interface QuoteEstimate {
    // Définition de la réponse d'estimation de prix
}