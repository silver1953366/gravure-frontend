// src/app/core/services/catalog/catalog.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // 👈 Import de HttpParams est essentiel
import { Observable } from 'rxjs';

// Imports des modèles
import { Material } from '../../models/material.model'; 
import { Shape } from '../../models/shape.model'; 
import { MaterialDimension } from '../../models/material-dimension.model';
import { Category } from '../../models/category.model'; 

import { environment } from '../../../environments/environment'; 

@Injectable({
 providedIn: 'root'
})
export class CatalogService {
    // ⚠️ Assurez-vous que environment.apiUrl inclut /api : 'http://127.0.0.1:8000/api'
    // La variable apiUrl sera donc : 'http://127.0.0.1:8000/api/catalog'
  private apiUrl = `${environment.apiUrl}/catalog`; 

  private http = inject(HttpClient);

 // --- 1. CATÉGORIES (Méthode inchangée) ---
 /**
   * Route: GET /api/catalog/categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

 // --- 2. MATÉRIAUX (Méthode inchangée) ---
 /**
   * Route: GET /api/catalog/materials
   */
  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materials`);
  }

 // --- 3. FORMES (Méthode inchangée) ---
 /**
   * Route: GET /api/catalog/shapes
   */
  getAllShapes(): Observable<Shape[]> {
    return this.http.get<Shape[]>(`${this.apiUrl}/shapes`);
  }
  
  // --- 4. DIMENSIONS FILTRÉES (CORRIGÉE : Cible /dimensions) ---
 /**
   * Récupère les dimensions spécifiques filtrées par Material et Shape ID.
   * Route API réelle : GET /api/catalog/dimensions?material_id=X&shape_id=Y
   */
  getDimensions(materialId: number, shapeId: number): Observable<MaterialDimension[]> {
    
    // Crée les paramètres d'URL (query string)
    const params = new HttpParams()
        .set('material_id', materialId.toString())
        .set('shape_id', shapeId.toString());
    
    // CORRECTION CRUCIALE : Cible la route publique de Laravel /dimensions
    const url = `${this.apiUrl}/dimensions`;
    
    console.log(`[CATALOG SERVICE] Appel dimensions filtrées : ${url}?${params.toString()}`); 
    
    return this.http.get<MaterialDimension[]>(url, { params });
  }

  // --- Méthodes de l'ancien code (pour la rétrocompatibilité) ---
  
  getMaterials(): Observable<Material[]> { 
      return this.getAllMaterials(); 
  }
  
  getShapes(): Observable<Shape[]> { 
      return this.getAllShapes(); 
  }
  
  /**
   * Récupère toutes les dimensions sans filtre.
   * Route API réelle : GET /api/catalog/dimensions
   */
  getMaterialDimensions(): Observable<MaterialDimension[]> {
    // CORRECTION : S'assurer que cela pointe aussi vers la route publique /dimensions
    return this.http.get<MaterialDimension[]>(`${this.apiUrl}/dimensions`);
  }
}