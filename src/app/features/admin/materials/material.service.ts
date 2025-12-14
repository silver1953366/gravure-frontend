import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Modèle de Matériau (basé sur votre interface mockée)
export interface Material {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    price_per_sq_meter: number;
    thickness_options: string;
    is_active: boolean;
    category_id: number; 
}

@Injectable({
    providedIn: 'root'
})
export class MaterialService {
    
    private http = inject(HttpClient);
    // ⭐ Utilisation de l'API Admin pour le CRUD des matériaux
    private readonly apiUrl = `${environment.apiUrl}/admin/materials`; 

    /** GET: Récupère la liste de tous les matériaux */
    getMaterials(): Observable<Material[]> {
        return this.http.get<Material[]>(this.apiUrl);
    }

    /** GET: Récupère un matériau par ID */
    getMaterial(id: number): Observable<Material> {
        return this.http.get<Material>(`${this.apiUrl}/${id}`);
    }

    /** POST: Crée un nouveau matériau (accepte FormData pour fichiers) */
    createMaterial(formData: FormData): Observable<Material> {
        return this.http.post<Material>(this.apiUrl, formData);
    }

    /** POST: Met à jour un matériau existant (utilise POST/PUT avec FormData) */
    updateMaterial(id: number, formData: FormData): Observable<Material> {
        // Le backend doit gérer le _method=PUT dans le FormData
        return this.http.post<Material>(`${this.apiUrl}/${id}`, formData);
    }

    /** DELETE: Supprime un matériau */
    deleteMaterial(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}