import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Assumer que l'interface InventoryItem est la même que celle de l'Admin
export interface InventoryItem {
    id: number;
    material_id: number;
    quantity: number;
    // ... autres champs ...
}

@Injectable({
    providedIn: 'root'
})
export class ControllerInventoryService {
    // 🛑 ATTENTION : L'URL NE CONTIENT PAS '/admin'. Elle appelle la route protégée par IsController.
    private readonly apiUrl = `${environment.apiUrl}/inventory`; 

    constructor(private http: HttpClient) {}

    /** * GET: Récupère la liste de l'inventaire. 
     * Route API: GET /api/inventory (Protégée par IsController) 
     */
    getInventoryList(): Observable<InventoryItem[]> {
        return this.http.get<InventoryItem[]>(this.apiUrl);
    }

    /** * GET: Récupère le détail d'un article. 
     * Route API: GET /api/inventory/{id} (Protégée par IsController) 
     */
    getInventoryItem(id: number): Observable<InventoryItem> {
        return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
    }

    // ❌ PAS DE CRUD : Pas de create/update/delete ici (réservé à l'Admin)
}