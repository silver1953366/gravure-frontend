import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carousel } from '../../models/carousel.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  // URLs de base conformes à api.php
  private apiUrl = `${environment.apiUrl}/carousel`;
  private adminApiUrl = `${environment.apiUrl}/admin/carousel`;
  
  private http = inject(HttpClient);

  /**
   * PUBLIC: Récupère les slides actives
   * Route api.php: GET /api/carousel -> CarouselController@index
   */
  getPublicCarousel(): Observable<Carousel[]> {
    return this.http.get<Carousel[]>(this.apiUrl);
  }

  /**
   * ADMIN: Récupère TOUTES les slides (actives et inactives)
   * Route api.php: GET /api/admin/carousel/all -> CarouselController@indexAdmin
   * IMPORTANT: Le suffixe '/all' est obligatoire ici selon votre api.php
   */
  getAdminCarousel(): Observable<Carousel[]> {
    return this.http.get<Carousel[]>(`${this.adminApiUrl}/all`);
  }

  /**
   * ADMIN: Crée une nouvelle slide
   * Route api.php: POST /api/admin/carousel -> CarouselController@store
   */
  createSlide(formData: FormData): Observable<Carousel> {
    return this.http.post<Carousel>(this.adminApiUrl, formData);
  }

  /**
   * ADMIN: Met à jour une slide
   * Route api.php: PUT /api/admin/carousel/{id} -> CarouselController@update
   * Note: On utilise POST + _method=PUT pour le support des images
   */
  updateSlide(id: number, formData: FormData): Observable<Carousel> {
    if (!formData.has('_method')) {
      formData.append('_method', 'PUT');
    }
    return this.http.post<Carousel>(`${this.adminApiUrl}/${id}`, formData);
  }

  /**
   * ADMIN: Supprime une slide
   * Route api.php: DELETE /api/admin/carousel/{id} -> CarouselController@destroy
   */
  deleteSlide(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`);
  }
}