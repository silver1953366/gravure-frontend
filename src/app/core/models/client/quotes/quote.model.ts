// src/app/core/models/client/quotes/quote.model.ts

import { Attachment } from './attachment.model'; 
import { Material } from '../../material.model'; 
import { Shape } from '../../shape.model'; 
import { MaterialDimension } from '../../material-dimension.model';

// --- Types de base ---
export type QuoteStatus = 'draft' | 'sent' | 'calculated' | 'ordered' | 'rejected' | 'archived';

/**
 * Informations simplifiées sur l'utilisateur propriétaire
 */
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
 * Interface synchronisée avec le modèle Laravel App\Models\Quote
 */
export interface Quote {
    id: number;
    reference: string;
    user_id: number | null;
    order_id: number | null;

    /**
     * Snapshot des informations client au moment de la demande
     * Casté en 'array' dans Laravel
     */
    client_details: {
        name: string;
        email: string;
        phone?: string;
        address?: string; // AJOUTÉ : Crucial pour corriger l'erreur TS2339 lors de la conversion
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

    /**
     * Historique du calcul et détails de personnalisation
     * Casté en 'array' dans Laravel
     */
    details_snapshot: {
        customization?: {
            description?: string;
            [key: string]: any;
        };
        full_estimate?: any; // Snapshot de l'objet QuoteEstimate
        [key: string]: any; 
    };

    admin_note?: string;

    // Dates (ISO String ou objet Date)
    created_at: string | Date;
    updated_at: string | Date;

    // Relations (chargées via with() dans Laravel)
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
        address?: string; // Inclus également ici pour la création
    };
    customization_details?: {
        description?: string;
        [key: string]: any;
    };
    file_ids: number[];
    discount_id?: number | null;
    status?: string; //
}

/**
 * Réponse pour l'estimation immédiate (QuoteController@estimate)
 */
export interface QuoteEstimate {
    unit_price_fcfa: number;
    quantity: number;
    price_source: string;
    
    material_name?: string; 
    shape_name?: string;
    dimension_label: string;
    
    cost_details: {
        base_price_fcfa: number;
        discount_amount_fcfa: number;
        final_price_fcfa: number;
        details_snapshot: {
            discount_id?: number | null;
            discount_name?: string;
            original_unit_price?: number;
        };
    };
}

// --- Interface Principale : Order (Commande) ---
/**
 * Représente une commande générée à partir d'un devis
 */
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