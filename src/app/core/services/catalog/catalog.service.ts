import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model'; 
import { Material } from '../../models/material.model'; 
// Importation des modèles manquants
import { Shape } from '../../models/shape.model'; 
import { MaterialDimension } from '../../models/material-dimension.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = 'http://localhost:8000/api/catalog'; 

  private http = inject(HttpClient);

  /**
   * Récupère la liste de toutes les catégories actives.
   * Route: GET /api/catalog/categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Récupère la liste de tous les matériaux actifs.
   * Route: GET /api/catalog/materials
   */
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materials`);
  }
  
  // --- NOUVELLE MÉTHODE REQUISE ---
  /**
   * Récupère la liste de toutes les formes actives.
   * Route: GET /api/catalog/shapes (supposition logique)
   */
  getShapes(): Observable<Shape[]> {
    return this.http.get<Shape[]>(`${this.apiUrl}/shapes`);
  }

  // --- NOUVELLE MÉTHODE REQUISE ---
  /**
   * Récupère la liste de toutes les dimensions de matériaux.
   * Route: GET /api/catalog/material-dimensions (supposition logique)
   */
  getMaterialDimensions(): Observable<MaterialDimension[]> {
    return this.http.get<MaterialDimension[]>(`${this.apiUrl}/material-dimensions`);
  }
}