import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment'; 

import { Material } from '../../models/material.model';
import { Shape } from '../../../core/models/shape.model';
import { MaterialDimension } from '../../../core/models/material-dimension.model';
import { QuotePayload } from '../../../core/models/client/quotes/quote.model';

export interface FormSelections {
    materials: Material[];
    shapes: Shape[];
    dimensions: MaterialDimension[];
}

export interface CartItem {
    id: number;
    material_id: number;
    shape_id: number;
    material_dimension_id: number;
    quantity: number;
}

interface QuoteResponse {
    message: string;
    quote_id: number;
}

@Injectable({
    providedIn: 'root'
})
export class QuoteFormService { 
    
    private http = inject(HttpClient);
    private catalogUrl = `${environment.apiUrl}/catalog`;
    private cartUrl = `${environment.apiUrl}/cart`;

    /**
     * Récupère les données via les routes définies dans le groupe 'catalog' de api.php
     */
    getFormSelections(): Observable<FormSelections> {
        return forkJoin({
            materials: this.http.get<Material[]>(`${this.catalogUrl}/materials`),
            shapes: this.http.get<Shape[]>(`${this.catalogUrl}/shapes`),
            dimensions: this.http.get<MaterialDimension[]>(`${this.catalogUrl}/dimensions`)
        });
    }

    /**
     * Récupère le contenu du panier (Route publique /api/cart)
     */
    getCartContent(): Observable<CartItem[]> {
        return this.http.get<CartItem[]>(this.cartUrl);
    }
    
    /**
     * Transforme un item de panier en payload pour le formulaire de devis.
     */
    convertCartToQuotePayload(cartItems: CartItem[]): Partial<QuotePayload> | null {
        if (!cartItems || cartItems.length === 0) return null;
        
        const firstItem = cartItems[0];
        return {
            material_id: firstItem.material_id,
            shape_id: firstItem.shape_id,
            material_dimension_id: firstItem.material_dimension_id,
            quantity: firstItem.quantity
        };
    }

    /**
     * Méthode fallback pour l'envoi de FormData (fichiers natifs)
     */
    sendQuoteWithFormdata(formData: FormData): Observable<QuoteResponse> {
        // Cette route n'existe pas encore explicitement dans votre api.php (voir QuoteController@store)
        return this.http.post<QuoteResponse>(`${environment.apiUrl}/quotes/submit-direct`, formData);
    }
}