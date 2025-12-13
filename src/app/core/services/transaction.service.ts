import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Exportation explicite des interfaces depuis le service pour être importées dans les composants.
// Ceci corrige l'erreur TS2459 (Module '...' declares 'Order'/'Quote' locally, but it is not exported.)
import * as Models from '../models/client/quotes/quote.model';

export type Quote = Models.Quote;
export type Order = Models.Order;
export type QuoteItem = Models.QuoteItem;
export type OrderItem = Models.OrderItem;
export type QuoteStatus = Models.QuoteStatus;


// Constantes d'URL de l'API (à adapter à votre configuration)
const QUOTE_API_URL = '/api/admin/quotes'; 
const ORDER_API_URL = '/api/admin/orders'; 

/**
 * Service central pour la gestion des transactions (Devis et Commandes).
 */
@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(private http: HttpClient) {}

    // ------------------------------------
    // --- Méthodes Devis (Quotes) ---
    // ------------------------------------

    getAllQuotes(): Observable<Quote[]> {
        return this.http.get<Quote[]>(QUOTE_API_URL);
    }
    
    getQuoteById(id: number): Observable<Quote> {
        return this.http.get<Quote>(`${QUOTE_API_URL}/${id}`);
    }

    deleteQuote(id: number): Observable<void> {
        return this.http.delete<void>(`${QUOTE_API_URL}/${id}`);
    }

    calculateQuote(id: number, priceData: { final_price: number }): Observable<Quote> {
        return this.http.post<Quote>(`${QUOTE_API_URL}/${id}/calculate`, priceData);
    }

    rejectQuote(id: number): Observable<void> {
        return this.http.post<void>(`${QUOTE_API_URL}/${id}/reject`, {});
    }

    convertQuoteToOrder(quoteId: number): Observable<Order> {
        return this.http.post<Order>(`${QUOTE_API_URL}/${quoteId}/convert`, {});
    }

    // ------------------------------------
    // --- Méthodes Commandes (Orders) ---
    // ------------------------------------

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(ORDER_API_URL);
    }
    
    /**
     * Récupère le détail d'une commande par ID.
     */
    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${ORDER_API_URL}/${id}`);
    }
    
    /**
     * Met à jour le statut d'une commande.
     */
    updateOrderStatus(id: number, status: string): Observable<Order> {
        return this.http.post<Order>(`${ORDER_API_URL}/${id}/status`, { status });
    }
    
    /**
     * Supprime une commande par ID.
     */
    deleteOrder(id: number): Observable<void> {
        return this.http.delete<void>(`${ORDER_API_URL}/${id}`);
    }
}