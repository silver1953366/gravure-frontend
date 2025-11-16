import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Material {
    id: number;
    name: string; // Ex: "Aluminium 5052"
    slug: string; // Ex: "aluminium-5052"
    description?: string;
    thickness_options?: string; // Ex: "1mm, 2mm, 3mm" (peut être un tableau côté backend)
    price_per_sq_meter: number; // Prix de base au m² (sans usinage)
    image_url?: string; // URL de l'image (stockée après l'upload)
    is_active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MaterialService {
    private readonly apiUrl = `${environment.apiUrl}/admin/materials`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de tous les matériaux */
    getMaterials(): Observable<Material[]> {
        return this.http.get<Material[]>(this.apiUrl);
    }
    
    /** GET: Récupère un seul matériau par ID */
    getMaterial(materialId: number): Observable<Material> {
        return this.http.get<Material>(`${this.apiUrl}/${materialId}`);
    }

    /** POST: Crée un nouveau matériau (accepte FormData pour l'upload) */
    createMaterial(materialData: FormData): Observable<Material> {
        // Envoi du FormData
        return this.http.post<Material>(this.apiUrl, materialData);
    }

    /** PUT/PATCH: Met à jour un matériau existant (accepte FormData pour l'upload) */
    updateMaterial(materialId: number, materialData: FormData): Observable<Material> {
        // NOTE IMPORTANTE: Lorsque FormData est utilisé avec PUT/PATCH, beaucoup de frameworks 
        // back-end, y compris Laravel, exigent que la requête soit envoyée en POST 
        // avec un champ _method: 'PUT' dans le FormData.
        materialData.append('_method', 'PUT'); 
        return this.http.post<Material>(`${this.apiUrl}/${materialId}`, materialData);
    }

    /** DELETE: Supprime un matériau */
    deleteMaterial(materialId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${materialId}`);
    }
}