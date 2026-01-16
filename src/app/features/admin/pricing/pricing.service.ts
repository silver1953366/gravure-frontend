// src/app/features/admin/pricing/pricing.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaterialDimension, Material, Shape, Category } from '../../../core/models/category.model'; 
// Assurez-vous d'adapter le chemin ci-dessus

@Injectable({
    providedIn: 'root'
})
export class PricingService { // On garde le nom de fichier/service pour le moment

    private readonly baseUrl = `${environment.apiUrl}/admin`;

    // Catalogue des Prix par Dimension
    private readonly dimensionsUrl = `${this.baseUrl}/material-dimensions`;
    // Dépendances
    private readonly materialsUrl = `${this.baseUrl}/materials`;
    private readonly shapesUrl = `${this.baseUrl}/shapes`;
    private readonly categoriesUrl = `${this.baseUrl}/categories`;

    constructor(private http: HttpClient) {}

    // --- Opérations CRUD pour MaterialDimension ---

    /** GET: Récupère toutes les entrées du catalogue (Index) */
    getMaterialDimensions(): Observable<MaterialDimension[]> {
        return this.http.get<MaterialDimension[]>(this.dimensionsUrl);
    }
    
    /** POST: Crée une nouvelle entrée de prix (Store) */
    createMaterialDimension(data: MaterialDimension): Observable<MaterialDimension> {
        return this.http.post<MaterialDimension>(this.dimensionsUrl, data);
    }
    
    /** PATCH: Met à jour une entrée de prix existante (Update) */
    updateMaterialDimension(id: number, data: Partial<MaterialDimension>): Observable<MaterialDimension> {
        return this.http.patch<MaterialDimension>(`${this.dimensionsUrl}/${id}`, data);
    }
    
    /** DELETE: Supprime une entrée de prix (Destroy) */
    deleteMaterialDimension(id: number): Observable<void> {
        return this.http.delete<void>(`${this.dimensionsUrl}/${id}`);
    }

    // --- Opérations pour les Dépendances (pour les listes déroulantes) ---
    
    getMaterials(): Observable<Material[]> {
        return this.http.get<Material[]>(this.materialsUrl);
    }

    getShapes(): Observable<Shape[]> {
        return this.http.get<Shape[]>(this.shapesUrl);
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }
}