import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importer les interfaces nouvellement créées
import { Category, Material, Shape } from '../models/catalog.model';

@Injectable({
  providedIn: 'root' 
})
export class CatalogService {
  
  private http = inject(HttpClient);
  // URL de base de votre API - à ajuster si nécessaire
  private readonly API_BASE_URL = 'http://localhost:8000/api'; 
  
  constructor() { }

  /**
   * GET /api/catalog/categories
   * Récupère la liste des catégories actives.
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_BASE_URL}/catalog/categories`);
  }

  /**
   * GET /api/catalog/materials
   * Récupère la liste des matériaux actifs avec leurs catégories.
   */
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.API_BASE_URL}/catalog/materials`);
  }

  /**
   * GET /api/catalog/shapes
   * Récupère la liste des formes actives.
   */
  getShapes(): Observable<Shape[]> {
    return this.http.get<Shape[]>(`${this.API_BASE_URL}/catalog/shapes`);
  }
}
