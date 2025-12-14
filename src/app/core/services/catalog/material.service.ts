import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../../models/material.model';
import { environment } from '../../../environments/environment'; // Ajustez le chemin si nécessaire


@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  // ⚠️ ASSUMPTION : Utilise la route publique du catalogue pour la lecture
  private apiUrl = `${environment.apiUrl}/catalog/materials`; 

  private http = inject(HttpClient);

  /**
   * Récupère la liste de tous les matériaux.
   */
  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }
}