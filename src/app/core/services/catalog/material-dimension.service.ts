// src/app/core/services/catalog/material-dimension.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialDimension } from '../../models/material-dimension.model';
import { environment } from '../../../environments/environment'; 


@Injectable({
  providedIn: 'root'
})
export class MaterialDimensionService {
    // Si environment.apiUrl inclut /api : 'http://127.0.0.1:8000/api'
  private apiUrl = `${environment.apiUrl}/catalog/dimensions`; // <-- CIBLE : /api/catalog/dimensions

  private http = inject(HttpClient);

  /**
   * Récupère toutes les entrées du catalogue de dimensions (sans filtre).
   */
  getAllDimensions(): Observable<MaterialDimension[]> {
    // Cette requête appelle /api/catalog/dimensions
    return this.http.get<MaterialDimension[]>(this.apiUrl);
  }
  
  // Si ce service devait faire l'appel filtré, la méthode serait similaire au CatalogService:
  /*
  getFilteredDimensions(materialId: number, shapeId: number): Observable<MaterialDimension[]> {
      const params = new HttpParams().set('material_id', materialId.toString()).set('shape_id', shapeId.toString());
      return this.http.get<MaterialDimension[]>(this.apiUrl, { params });
  }
  */
}