import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialDimension } from '../../models/material-dimension.model';
import { environment } from '../../../environments/environment'; // Ajustez le chemin si nécessaire


@Injectable({
  providedIn: 'root'
})
export class MaterialDimensionService {
  // L'URL pointe maintenant vers la nouvelle route PUBLIQUE définie dans api.php
  private apiUrl = `${environment.apiUrl}/catalog/dimensions`; // <-- CHEMIN CORRIGÉ

  private http = inject(HttpClient);

  /**
   * Récupère toutes les entrées du catalogue de dimensions (MaterialDimension).
   */
  getAllDimensions(): Observable<MaterialDimension[]> {
    // Cette requête n'a plus besoin d'un jeton d'authentification pour la lecture
    return this.http.get<MaterialDimension[]>(this.apiUrl);
  }
}