// src/app/core/services/transaction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

// --- Interfaces Globales ---

export interface UserInfo {
    id: number;
    name: string;
    email: string;
}

export interface QuoteItem {
    id?: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
}

export interface Quote {
    id: number;
    user_id: number;
    user?: UserInfo; // Utilisateur lié
    status: 'draft' | 'submitted' | 'rejected' | 'ordered' | 'deleted';
    total_price: number;
    created_at: Date;
    items: QuoteItem[];
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
    user?: UserInfo; // Utilisateur lié
    quote_id: number; // Référence au devis source
    status: 'pending_payment' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';
    total_price: number;
    created_at: Date;
    items: OrderItem[];
}

// --- Données Mock (Simulation) ---

const MOCK_USERS: UserInfo[] = [
    { id: 1, name: 'Alpha Client', email: 'alpha@corp.com' },
    { id: 2, name: 'Beta Solutions', email: 'beta@sol.com' },
];

const MOCK_QUOTES: Quote[] = [
    {
        id: 101, user_id: 1, status: 'submitted', total_price: 150000, created_at: new Date('2025-10-10'),
        items: [{ product_name: 'Plaque XL', unit_price: 50000, quantity: 3, subtotal: 150000 }]
    },
    {
        id: 102, user_id: 2, status: 'ordered', total_price: 80000, created_at: new Date('2025-10-15'),
        items: [{ product_name: 'Gravure Médaille', unit_price: 1000, quantity: 80, subtotal: 80000 }]
    },
    {
        id: 103, user_id: 1, status: 'draft', total_price: 25000, created_at: new Date('2025-11-01'),
        items: [{ product_name: 'Porte-clés', unit_price: 500, quantity: 50, subtotal: 25000 }]
    },
];

const MOCK_ORDERS: Order[] = [
    {
        id: 501, user_id: 2, quote_id: 102, status: 'processing', total_price: 80000, created_at: new Date('2025-10-16'),
        items: [{ product_name: 'Gravure Médaille', unit_price: 1000, quantity: 80, subtotal: 80000 }]
    },
    {
        id: 502, user_id: 1, quote_id: 101, status: 'pending_payment', total_price: 150000, created_at: new Date('2025-10-11'),
        items: [{ product_name: 'Plaque XL', unit_price: 50000, quantity: 3, subtotal: 150000 }]
    },
];

/**
 * Service central pour la gestion des transactions (Devis et Commandes).
 */
@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(private http: HttpClient) {
        // Associer les utilisateurs aux transactions pour le mock
        this.addUserInfoToTransactions(MOCK_QUOTES);
        this.addUserInfoToTransactions(MOCK_ORDERS);
    }

    private addUserInfoToTransactions(transactions: any[]): void {
        transactions.forEach(t => {
            t.user = MOCK_USERS.find(u => u.id === t.user_id);
        });
    }

    // --- Méthodes Devis (Quotes) ---

    getAllQuotes(): Observable<Quote[]> {
        return of(MOCK_QUOTES).pipe(delay(500));
    }

    getQuoteById(id: number): Observable<Quote> {
        const quote = MOCK_QUOTES.find(q => q.id === id);
        if (quote) {
            return of(quote).pipe(delay(500));
        }
        return throwError(() => new Error(`Devis #${id} introuvable.`));
    }

    deleteQuote(id: number): Observable<void> {
        return of(undefined).pipe(delay(300), tap(() => {
            const index = MOCK_QUOTES.findIndex(q => q.id === id);
            if (index !== -1) {
                MOCK_QUOTES.splice(index, 1);
            }
        }));
    }

    convertQuoteToOrder(quoteId: number): Observable<Order> {
        return of(MOCK_QUOTES.find(q => q.id === quoteId)).pipe(
            delay(500),
            map(quote => {
                if (!quote || quote.status !== 'submitted') {
                    throw new Error('Conversion impossible: Devis introuvable ou déjà traité.');
                }
                
                // 1. Mise à jour du statut du devis
                quote.status = 'ordered';

                // 2. Création de la nouvelle commande
                const newOrderId = Math.max(...MOCK_ORDERS.map(o => o.id)) + 1;
                const newOrder: Order = {
                    id: newOrderId,
                    user_id: quote.user_id,
                    user: quote.user,
                    quote_id: quote.id,
                    status: 'pending_payment',
                    total_price: quote.total_price,
                    created_at: new Date(),
                    items: quote.items.map(item => ({ ...item, id: Math.random() }))
                };
                MOCK_ORDERS.push(newOrder);

                return newOrder;
            })
        );
    }

    // --- Méthodes Commandes (Orders) ---

    getAllOrders(): Observable<Order[]> {
        return of(MOCK_ORDERS).pipe(delay(500));
    }

    getOrderById(id: number): Observable<Order> {
        const order = MOCK_ORDERS.find(o => o.id === id);
        if (order) {
            return of(order).pipe(delay(500));
        }
        return throwError(() => new Error(`Commande #${id} introuvable.`));
    }

    updateOrderStatus(id: number, newStatus: Order['status']): Observable<void> {
        return of(undefined).pipe(delay(300), tap(() => {
            const order = MOCK_ORDERS.find(o => o.id === id);
            if (order) {
                order.status = newStatus;
            } else {
                throw new Error(`Commande #${id} introuvable.`);
            }
        }));
    }
}