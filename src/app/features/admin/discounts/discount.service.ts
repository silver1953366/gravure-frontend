// src/app/features/admin/discounts/discounts.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// 🛑 INTERFACE CORRIGÉE : Utilise number | null pour l'ID
export interface Discount {
    id: number | null; 
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number | null;
    expires_at: string | null;
    is_active: boolean;
}

export type PartialDiscount = Partial<Discount>; 

@Injectable({
    providedIn: 'root'
})
export class DiscountsService {

    // Assurez-vous que l'environnement.apiUrl est correctement défini
    private readonly apiUrl = `${environment.apiUrl}/admin/discounts`;

    constructor(private http: HttpClient) {}

    /** GET: Récupère toutes les réductions */
    getAllDiscounts(): Observable<Discount[]> {
        return this.http.get<Discount[]>(this.apiUrl);
    }

    /** POST: Crée une nouvelle réduction (ID doit être null) */
    createDiscount(discount: Discount): Observable<Discount> {
        return this.http.post<Discount>(this.apiUrl, discount);
    }

    /** PUT/PATCH: Met à jour une réduction existante */
    updateDiscount(id: number, discount: PartialDiscount): Observable<Discount> {
        return this.http.patch<Discount>(`${this.apiUrl}/${id}`, discount);
    }

    /** DELETE: Supprime une réduction */
    deleteDiscount(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}