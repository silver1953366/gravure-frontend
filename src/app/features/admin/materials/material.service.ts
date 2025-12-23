import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Import de l'environnement (4 niveaux pour remonter à src/app/...)
import { environment } from '../../../environments/environment';

// Import du modèle (3 niveaux pour remonter à src/app/core/...)
import { Material } from '../../../core/models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private http = inject(HttpClient);
  
  /**
   * URL vers votre API Laravel. 
   * Assurez-vous que environment.apiUrl est défini sur 'http://localhost:8000/api'
   */
  private readonly apiUrl = `${environment.apiUrl}/admin/materials`;

  /** * GET: Récupère la liste de tous les matériaux 
   * Route: GET /api/admin/materials
   */
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  /** * GET: Récupère un matériau spécifique par son ID 
   * Route: GET /api/admin/materials/{id}
   */
  getMaterial(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  /** * POST: Crée un nouveau matériau avec support Multipart (Image)
   * Route: POST /api/admin/materials
   */
  createMaterial(formData: FormData): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, formData);
  }

  /** * POST: Met à jour un matériau existant 
   * Route: POST /api/admin/materials/{id}
   * Note: On utilise POST avec _method=PUT car PHP/Laravel ne traite pas 
   * nativement le 'multipart/form-data' via une requête PUT classique.
   */
  updateMaterial(id: number, formData: FormData): Observable<Material> {
    // Force la méthode PUT pour Laravel
    if (!formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    return this.http.post<Material>(`${this.apiUrl}/${id}`, formData);
  }

  /** * DELETE: Supprime un matériau 
   * Route: DELETE /api/admin/materials/{id}
   */
  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}