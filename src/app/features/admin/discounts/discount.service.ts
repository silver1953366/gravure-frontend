import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Si vous utilisez un fichier environment.ts pour l'URL de base
import { environment } from '../../../environments/environment';

// INTERFACE DISCOUNT : Définit la structure des données des réductions
export interface Discount {
    id: number | null; 
    name: string;
    code: string;
    type: 'percentage' | 'fixed'; // Type de remise (pourcentage ou montant fixe)
    value: number; // Valeur de la remise (ex: 10 si c'est 10% ou 5000 si c'est 5000 FCFA)
    min_order_amount: number | null; // Montant minimum requis pour l'application
    expires_at: string | null; // Date d'expiration (string pour le formulaire date)
    is_active: boolean;
}

export type PartialDiscount = Partial<Discount>; 

@Injectable({
    providedIn: 'root'
})
export class DiscountsService {

    // Assurez-vous que l'environnement.apiUrl est correctement défini (ex: http://localhost:8000/api)
    private readonly apiUrl = `${environment.apiUrl}/admin/discounts`;

    constructor(private http: HttpClient) {}

    /** GET: Récupère toutes les réductions */
    getAllDiscounts(): Observable<Discount[]> {
        return this.http.get<Discount[]>(this.apiUrl);
    }

    /** POST: Crée une nouvelle réduction (ID doit être null) */
    createDiscount(discount: Discount): Observable<Discount> {
        // Envoie toutes les données, y compris l'ID null ou les champs optionnels
        return this.http.post<Discount>(this.apiUrl, discount);
    }

    /** PUT/PATCH: Met à jour une réduction existante */
    updateDiscount(id: number, discount: PartialDiscount): Observable<Discount> {
        // Utilisez PATCH pour envoyer uniquement les modifications si le backend le supporte
        return this.http.patch<Discount>(`${this.apiUrl}/${id}`, discount);
    }

    /** DELETE: Supprime une réduction */
    deleteDiscount(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}