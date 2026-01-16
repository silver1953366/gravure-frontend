/**
 * Interface représentant une notification unique dans le système.
 */
export interface Notification {
    id: number;
    user_id: number;
    
    // Types stricts pour correspondre aux constantes du modèle PHP et CSS
    type: 'info' | 'warning' | 'success' | 'error'; 
    
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    
    // Dates formatées en string ISO par Laravel
    created_at: string;
    updated_at?: string;

    // Inclus lors de la consultation par l'Admin (relation user:id,name,email)
    user?: { 
        id: number; 
        name: string; 
        email: string 
    };

    /** * RELATION POLYMORPHIQUE
     * resource_type: "App\Models\Quote" ou "App\Models\Order"
     * resource: l'objet complet du devis ou de la commande (si chargé par le backend)
     */
    resource_id?: number;
    resource_type?: string;
    resource?: any; 
}

/**
 * Interface pour la charge utile lors de l'envoi d'une notification (Admin).
 */
export interface NotificationPayload {
    /** ID unique ou tableau d'IDs pour un envoi groupé */
    user_id: number | number[]; 
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    link?: string;
    
    // Facultatif : permet de lier manuellement à un objet
    resource_id?: number;
    resource_type?: string;
}

/**
 * Interface pour gérer la réponse paginée de Laravel
 */
export interface NotificationPagination {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url?: string;
    prev_page_url?: string;
}