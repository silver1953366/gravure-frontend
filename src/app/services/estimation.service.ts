import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstimationRequest, EstimationResult } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class EstimationService {
  
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:8000/api'; 

  constructor() { }

  /**
   * POST /api/catalog/quotes/estimate
   * Envoie les données du projet au backend pour un calcul de prix instantané.
   * Utilise FormData pour gérer l'upload de fichier.
   * @param requestData Les données de l'estimation.
   */
  calculateEstimate(requestData: EstimationRequest): Observable<EstimationResult> {
    
    const formData = new FormData();
    
    // Ajout des champs standards
    formData.append('material_id', requestData.material_id.toString());
    formData.append('shape_id', requestData.shape_id.toString());
    formData.append('width', requestData.width.toString());
    formData.append('height', requestData.height.toString());
    formData.append('quantity', requestData.quantity.toString());
    formData.append('thickness', requestData.thickness.toString());
    
    // Ajout du fichier
    if (requestData.file) {
      // Le nom de champ 'file' doit correspondre à la validation Laravel
      formData.append('file', requestData.file, requestData.file.name); 
    }

    return this.http.post<EstimationResult>(`${this.API_BASE_URL}/catalog/quotes/estimate`, formData);
  }
}
