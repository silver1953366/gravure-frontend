import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // 🛑 CORRIGÉ : Importation de l'environnement

export interface InventoryItem {
    id: number;
    // Propriétés provenant de MaterialDimension ou Material (pour l'affichage)
    reference: string; 
    description: string;
    location: string; // (Assumé, peut-être lié à l'emplacement physique)
    material_id?: number; 
    
    // Propriétés provenant de la table Inventory
    stock_quantity: number; // 🛑 CORRIGÉ : Nom plus explicite pour le stock total
    reserved_quantity: number; // Quantité réservée (stock_reserve dans votre ancienne interface)
    minimum_threshold: number; // Seuil minimum (stock_minimum dans votre ancienne interface)
    price_per_unit: number; 
    
    // Propriété calculée (comme dans le modèle Laravel)
    available_quantity: number; 
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    // URL Publique (pour la lecture par les rôles 'controller' ou 'logistics')
    private readonly publicApiUrl = `${environment.apiUrl}/inventory`; 
    // URL Admin (pour la création/modification/suppression par le rôle 'admin')
    private readonly adminApiUrl = `${environment.apiUrl}/admin/inventory`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de tout l'inventaire */
    // Cette route est accessible via /api/inventory (protégée par IsController/Logistics)
    getInventory(): Observable<InventoryItem[]> {
        return this.http.get<InventoryItem[]>(this.publicApiUrl);
    }
    
    /** GET: Récupère un seul article (pour l'édition ou les détails) */
    // Cette route est accessible via /api/inventory/{id}
    getInventoryItem(itemId: number): Observable<InventoryItem> {
        return this.http.get<InventoryItem>(`${this.publicApiUrl}/${itemId}`);
    }

    /** POST: Crée un nouvel article d'inventaire (Admin only) */
    createItem(itemData: Partial<InventoryItem>): Observable<InventoryItem> {
        return this.http.post<InventoryItem>(this.adminApiUrl, itemData);
    }

    /** PUT: Met à jour un article d'inventaire existant (Admin only) */
    updateItem(itemId: number, itemData: Partial<InventoryItem>): Observable<InventoryItem> {
        return this.http.put<InventoryItem>(`${this.adminApiUrl}/${itemId}`, itemData);
    }

    /** DELETE: Supprime un article d'inventaire (Admin only) */
    deleteItem(itemId: number): Observable<void> {
        return this.http.delete<void>(`${this.adminApiUrl}/${itemId}`);
    }
}