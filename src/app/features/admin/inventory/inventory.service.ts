import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
    id: number;
    reference: string;
    description: string;
    quantity: number;
    location: string;
    material_id?: number; // Optionnel si l'inventaire est lié au catalogue
    price_per_unit: number;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    // Route de lecture (accessible Admin/Controller)
    private readonly publicApiUrl = `${environment.apiUrl}/inventory`; 
    // Route CRUD (accessible Admin seul)
    private readonly adminApiUrl = `${environment.apiUrl}/admin/inventory`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de tout l'inventaire (Admin/Controller) */
    getInventory(): Observable<InventoryItem[]> {
        // Route API: GET /api/inventory
        return this.http.get<InventoryItem[]>(this.publicApiUrl);
    }

    /** POST: Crée un nouvel article (Admin SEUL) */
    createItem(itemData: any): Observable<InventoryItem> {
        // Route API: POST /api/admin/inventory
        return this.http.post<InventoryItem>(this.adminApiUrl, itemData);
    }

    /** PUT: Met à jour un article (Admin SEUL) */
    updateItem(itemId: number, itemData: any): Observable<InventoryItem> {
        // Route API: PUT /api/admin/inventory/{id}
        return this.http.put<InventoryItem>(`${this.adminApiUrl}/${itemId}`, itemData);
    }

    /** DELETE: Supprime un article (Admin SEUL) */
    deleteItem(itemId: number): Observable<void> {
        // Route API: DELETE /api/admin/inventory/{id}
        return this.http.delete<void>(`${this.adminApiUrl}/${itemId}`);
    }
}