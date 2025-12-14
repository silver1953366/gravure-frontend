

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
    id: number;
    name: string;
    reference: string;
    description: string;
    unit_cost: number; // Coût unitaire pour l'estimation de production
    // Ajoutez ici des champs techniques importants pour le Controller (ex: dimensions, matériaux de base)
}

@Injectable({
    providedIn: 'root'
})
export class ControllerCatalogueService {
    // Utilise la route API Catalogue (lecture seule)
    private readonly apiUrl = `${environment.apiUrl}/catalogue`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste complète des produits. */
    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }
    
    /** GET: Récupère le détail d'un produit. */
    getProductDetail(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }
}