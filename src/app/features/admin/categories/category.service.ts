import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
    id: number;
    name: string; // Ex: "Découpe Laser", "Tôlerie Fine"
    slug: string; // Ex: "decoupe-laser"
    description?: string;
    is_active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    // Route API: CRUD pour les catégories (Admin SEUL)
    private readonly apiUrl = `${environment.apiUrl}/admin/categories`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de toutes les catégories */
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl);
    }
    
    /** GET: Récupère une seule catégorie par ID */
    getCategory(categoryId: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${categoryId}`);
    }

    /** POST: Crée une nouvelle catégorie */
    createCategory(categoryData: any): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, categoryData);
    }

    /** PUT/PATCH: Met à jour une catégorie existante */
    updateCategory(categoryId: number, categoryData: any): Observable<Category> {
        return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, categoryData);
    }

    /** DELETE: Supprime une catégorie */
    deleteCategory(categoryId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${categoryId}`);
    }
}