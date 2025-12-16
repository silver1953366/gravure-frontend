import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment'; 

// Imports des modèles (ajustez les chemins)
// J'assume que ces modèles sont bien définis ailleurs dans votre projet
import { Material } from '../../models/material.model';
import { Shape } from '../../../core/models/shape.model';
import { MaterialDimension } from '../../../core/models/material-dimension.model';
// QuotePayload vient du fichier des modèles de devis
import { QuotePayload } from '../../../core/models/client/quotes/quote.model';

// Définition de la structure de réponse agrégée pour les sélections
export interface FormSelections {
    materials: Material[];
    shapes: Shape[];
    dimensions: MaterialDimension[];
}

// Définition simplifiée du modèle du panier pour le pré-remplissage
export interface CartItem {
    material_id: number;
    shape_id: number;
    material_dimension_id: number;
    quantity: number;
    // Ajoutez ici d'autres champs du panier si nécessaire (ex: client_ref)
}

interface QuoteResponse {
    message: string;
    quote_id: number; // Utilisé pour la redirection
}

// NOUVEAU
const API_BASE_URL = environment.apiUrl; 
const API_FORM_DATA_URL = `${API_BASE_URL}/form-data`; 
const API_CART_URL = `${API_BASE_URL}/client/cart`; // Endpoint pour récupérer le panier

@Injectable({
    providedIn: 'root'
})
export class QuoteFormService { 
    
    private http = inject(HttpClient);

    /**
     * Récupère toutes les données nécessaires au formulaire (Matériaux, Formes, Dimensions)
     * via un appel parallèle (forkJoin).
     * GET /api/form-data/...
     */
    getFormSelections(): Observable<FormSelections> {
        const materials$ = this.http.get<Material[]>(`${API_FORM_DATA_URL}/materials`);
        const shapes$ = this.http.get<Shape[]>(`${API_FORM_DATA_URL}/shapes`);
        const dimensions$ = this.http.get<MaterialDimension[]>(`${API_FORM_DATA_URL}/dimensions`);

        // Combinaison des Observables
        return forkJoin({
            materials: materials$,
            shapes: shapes$,
            dimensions: dimensions$
        });
    }

    /**
     * Récupère le contenu du panier pour pré-remplir le formulaire.
     * GET /api/client/cart
     */
    getCartContent(): Observable<CartItem[]> {
        return this.http.get<CartItem[]>(API_CART_URL);
    }
    
    /**
     * Convertit les données d'un panier (CartItem[]) en une charge utile de devis.
     * @param cartItems - Les éléments récupérés du panier.
     */
    convertCartToQuotePayload(cartItems: CartItem[]): Partial<QuotePayload> | null {
        if (cartItems.length === 0) {
            return null;
        }
        
        // On suppose que le devis est créé pour le premier élément du panier
        const firstItem = cartItems[0];
        
        return {
            material_id: firstItem.material_id,
            shape_id: firstItem.shape_id,
            material_dimension_id: firstItem.material_dimension_id,
            quantity: firstItem.quantity,
            // description: 'Devis initié depuis le panier' // Vous pouvez ajouter ceci si le champ est présent dans QuotePayload
        };
    }

    /**
     * **(Ancienne méthode conservée) :** Envoie les données du formulaire, y compris un fichier, à l'API.
     * Utilisé si vous avez un champ d'upload de fichier dans votre formulaire non géré par ClientAttachmentService.
     * POST /api/quotes/submit
     */
    sendQuoteWithFormdata(formData: FormData): Observable<QuoteResponse> {
        // L'URL ici doit correspondre à l'endpoint qui gère le FormData
        return this.http.post<QuoteResponse>(`${API_BASE_URL}/quotes/submit`, formData);
    }
}