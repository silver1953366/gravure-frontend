import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; 

/**
 * Interface représentant un article en stock.
 * Elle reflète la table 'inventories' et ses relations avec le catalogue 'material_dimensions'.
 */
export interface InventoryItem {
    id: number;
    // Clé étrangère vers le catalogue de prix
    material_dimension_id: number; 
    
    // Propriétés de stock physiques
    stock_quantity: number; 
    reserved_quantity: number; 
    minimum_threshold: number; 
    
    // Prix de revient spécifique à ce lot en stock
    price_per_unit: number; 
    
    // Propriété calculée (Stock Physique - Réservations)
    available_quantity: number; 

    /** * Relation vers le catalogue (MaterialDimension)
     * Contient les informations descriptives du matériau, de la forme et de la catégorie.
     */
    material_dimension?: {
        id: number;
        dimension_label: string;
        unit_price_fcfa: number; // Prix théorique du catalogue
        is_active: boolean;
        
        material?: {
            id: number;
            name: string;
        };
        shape?: {
            id: number;
            name: string;
        };
        category?: {
            id: number;
            name: string;
        };
    };
    
    // Timestamps Laravel
    last_restock_at?: string;
    created_at?: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    /** * URL Publique : Pour la consultation (Rôles : Controller, Logistics, Admin)
     * Correspond généralement aux routes protégées par 'auth:api'
     */
    private readonly publicApiUrl = `${environment.apiUrl}/inventory`; 

    /** * URL Admin : Pour les modifications (Rôle : Admin uniquement)
     * Correspond aux routes protégées par le middleware 'admin' sur le backend
     */
    private readonly adminApiUrl = `${environment.apiUrl}/admin/inventory`; 

    constructor(private http: HttpClient) {}

    /** * GET: Récupère la liste de tout l'inventaire.
     * Le backend doit retourner les relations avec : 
     * Inventory::with(['material_dimension.material', 'material_dimension.shape', 'material_dimension.category'])
     */
    getInventory(): Observable<InventoryItem[]> {
        return this.http.get<InventoryItem[]>(this.publicApiUrl);
    }
    
    /** * GET: Récupère un article spécifique par son ID.
     */
    getInventoryItem(itemId: number): Observable<InventoryItem> {
        return this.http.get<InventoryItem>(`${this.publicApiUrl}/${itemId}`);
    }

    /** * POST: Crée une nouvelle entrée d'inventaire.
     * @param itemData Contient au minimum material_dimension_id, stock_quantity et price_per_unit
     */
    createItem(itemData: Partial<InventoryItem>): Observable<InventoryItem> {
        return this.http.post<InventoryItem>(this.adminApiUrl, itemData);
    }

    /** * PUT: Met à jour les quantités ou le prix d'un article existant.
     */
    updateItem(itemId: number, itemData: Partial<InventoryItem>): Observable<InventoryItem> {
        return this.http.put<InventoryItem>(`${this.adminApiUrl}/${itemId}`, itemData);
    }

    /** * DELETE: Supprime définitivement une référence de l'inventaire (Admin).
     */
    deleteItem(itemId: number): Observable<void> {
        return this.http.delete<void>(`${this.adminApiUrl}/${itemId}`);
    }
}