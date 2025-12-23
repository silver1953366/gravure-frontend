// src/app/core/models/client/quotes/quote.model.ts

import { Attachment } from './attachment.model'; 
import { Material } from '../../material.model'; 
import { Shape } from '../../shape.model'; 
import { MaterialDimension } from '../../material-dimension.model';

// --- Types de base ---
export type QuoteStatus = 'draft' | 'sent' | 'calculated' | 'ordered' | 'rejected' | 'archived';

export interface UserInfo { 
    id: number; 
    name: string; 
    email: string; 
    address?: string; 
    phone?: string;
}

// --- Interfaces pour les Lignes de Devis/Commande ---
export interface QuoteItem {
    id?: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
}

// --- Interface Principale : Quote (Devis) ---
/**
 * Correspond au modèle App\Models\Quote de Laravel
 */
export interface Quote {
    id: number;
    reference: string;
    user_id: number | null;
    order_id: number | null;

    // Correspond au $casts 'client_details' => 'array'
    client_details: {
        name: string;
        email: string;
        phone?: string;
    };

    status: QuoteStatus;

    // Configuration technique
    material_id: number;
    shape_id: number;
    material_dimension_id: number | null;
    discount_id: number | null;
    quantity: number;
    dimension_label: string;
    price_source: string;

    // Tarification (Snapshot historique)
    unit_price_fcfa: number;
    base_price_fcfa: number;
    discount_amount_fcfa: number;
    final_price_fcfa: number;

    // Correspond au $casts 'details_snapshot' => 'array'
    // Contient l'historique complet du calcul et la personnalisation
    details_snapshot: {
        customization?: {
            description?: string;
            [key: string]: any;
        };
        full_estimate?: any; // Snapshot de l'objet QuoteEstimate reçu lors de la création
        [key: string]: any; 
    };

    admin_note?: string;

    // Dates
    created_at: string | Date;
    updated_at: string | Date;

    // Relations (Eloquent with())
    material?: Material; 
    shape?: Shape; 
    materialDimension?: MaterialDimension; 
    attachments?: Attachment[]; 
    user?: UserInfo; 
}

// --- Objets de Transfert de Données (DTO) ---

/**
 * Payload envoyé au backend pour créer un devis (POST /api/quotes)
 */
export interface QuotePayload {
    material_id: number;
    shape_id: number;
    material_dimension_id: number;
    quantity: number;
    client_details: {
        name: string;
        email: string;
        phone?: string;
    };
    customization_details?: {
        description?: string;
        [key: string]: any;
    };
    files?: number[]; // Tableau d'IDs d'attachments déjà uploadés
    discount_id?: number | null;
}

/**
 * Interface de réponse pour l'estimation immédiate
 * Synchronisée avec QuoteController@estimate
 */
export interface QuoteEstimate {
    // Informations de base
    unit_price_fcfa: number;
    quantity: number;
    price_source: string;
    
    // Labels descriptifs
    material_name?: string; 
    shape_name?: string;
    dimension_label: string;
    
    // Détails financiers structurés
    cost_details: {
        base_price_fcfa: number;
        discount_amount_fcfa: number;
        final_price_fcfa: number; // Le montant net à payer affiché à l'utilisateur
        details_snapshot: {
            discount_id?: number | null;
            discount_name?: string;
            original_unit_price?: number;
        };
    };
}

// --- Interface Principale : Order (Commande) ---
export interface Order {
    id: number;
    user_id: number;
    user?: UserInfo;
    quote_id: number;
    reference?: string;
    status: 'pending_payment' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';
    total_price: number;
    created_at: string | Date;
    updated_at: string | Date;
}