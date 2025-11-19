import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../../models/material.model'; 
import { Shape } from '../../models/shape.model'; 
import { MaterialDimension } from '../../models/material-dimension.model';
import { Category } from '../../models/category.model'; 
// Note: Les MOCKs ont été retirés de cette version car vous êtes en mode API réelle.

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // ⚠️ Assurez-vous que cette URL est correcte (localhost:8000 pour Laravel local)
  private apiUrl = 'http://localhost:8000/api/catalog'; 

  private http = inject(HttpClient);

  // --- 1. CATÉGORIES (Méthode inchangée) ---
  /**
   * Récupère la liste de toutes les catégories actives.
   * Route: GET /api/catalog/categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // --- 2. MATÉRIAUX (Méthode renommée) ---
  /**
   * Récupère la liste de tous les matériaux actifs.
   * (Méthode renommée pour la clarté dans le frontend)
   * Route: GET /api/catalog/materials
   */
  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materials`);
  }

  // --- 3. FORMES (Méthode renommée) ---
  /**
   * Récupère la liste de toutes les formes actives.
   * (Méthode renommée pour la clarté dans le frontend)
   * Route: GET /api/catalog/shapes
   */
  getAllShapes(): Observable<Shape[]> {
    return this.http.get<Shape[]>(`${this.apiUrl}/shapes`);
  }
  
  // --- 4. DIMENSIONS (Méthode de filtrage pour le Configurateur) ---
  /**
   * Récupère les dimensions spécifiques filtrées par Material et Shape ID.
   * Route: GET /api/catalog/material-dimensions?material_id=X&shape_id=Y
   */
  getDimensions(materialId: number, shapeId: number): Observable<MaterialDimension[]> {
    const params = {
        material_id: materialId.toString(),
        shape_id: shapeId.toString()
    };
    return this.http.get<MaterialDimension[]>(`${this.apiUrl}/material-dimensions`, { params });
  }

  // --- Méthodes de l'ancien code (à garder pour la rétrocompatibilité si utilisées ailleurs) ---
  // Si le composant 'catalog-list' utilise encore getMaterials(), vous pouvez le laisser ici:
  getMaterials(): Observable<Material[]> { return this.getAllMaterials(); }
  
  // Si vous avez besoin d'une liste complète des dimensions sans filtre:
  getMaterialDimensions(): Observable<MaterialDimension[]> {
    return this.http.get<MaterialDimension[]>(`${this.apiUrl}/material-dimensions`);
  }
  
  getShapes(): Observable<Shape[]> { return this.getAllShapes(); }
}