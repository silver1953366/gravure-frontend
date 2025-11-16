import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  // ⚠️ ASSUMPTION : Utilise la route publique du catalogue pour la lecture
  private apiUrl = 'http://localhost:8000/api/catalog/materials'; 

  private http = inject(HttpClient);

  /**
   * Récupère la liste de tous les matériaux.
   */
  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }
}