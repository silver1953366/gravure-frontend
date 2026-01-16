import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shape } from '../../models/shape.model'; 
import { environment } from '../../../environments/environment'; // Ajustez le chemin si nécessaire


@Injectable({
  providedIn: 'root'
})
export class ShapeService {
  // L'URL pointe vers la nouvelle route publique
private apiUrl = `${environment.apiUrl}/catalog/shapes`;
  private http = inject(HttpClient);

  /**
   * Récupère la liste de toutes les formes.
   */
  getAllShapes(): Observable<Shape[]> {
    return this.http.get<Shape[]>(this.apiUrl);
  }
}