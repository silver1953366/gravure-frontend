// src/app/features/controller/orders/controller-order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interface de Commande simplifiée (ajoutez les champs nécessaires)
export interface Order {
    id: number;
    user_id: number;
    status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'completed' | 'canceled';
    total_amount: number;
    created_at: string;
    // Ajout d'une propriété pour les détails de ligne de commande si nécessaire
    order_items?: any[]; 
}

@Injectable({
    providedIn: 'root'
})
export class ControllerOrderService {
    // Utilise le chemin API CLIENT/GLOBAL (/orders), accessible au Controller
    private readonly apiUrl = `${environment.apiUrl}/orders`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de toutes les commandes. */
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    /** GET: Récupère le détail d'une commande. */
    getOrderDetail(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    /** PUT: Mise à jour du statut (action de production Controller). */
    updateOrderStatus(orderId: number, newStatus: string): Observable<Order> {
        // Le Policy permet au Controller de modifier, l'endpoint /api/orders/{id} est utilisé.
        const updateUrl = `${this.apiUrl}/${orderId}`; 
        return this.http.put<Order>(updateUrl, { status: newStatus }); 
    }
}