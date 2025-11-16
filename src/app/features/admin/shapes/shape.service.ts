import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Shape {
    id: number;
    name: string; // Nom de la forme (ex: "Rectangle", "Cercle")
    slug: string; // Slug unique (ex: "rectangle", "cercle")
    description?: string; // Description ou règles associées
    image_url?: string; // Lien vers l'icône ou l'image de la forme
    is_active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ShapeService {
    // Route API: CRUD pour les formes (Admin SEUL)
    private readonly apiUrl = `${environment.apiUrl}/admin/shapes`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de toutes les formes */
    getShapes(): Observable<Shape[]> {
        // Route API: GET /api/admin/shapes
        return this.http.get<Shape[]>(this.apiUrl);
    }
    
    /** GET: Récupère une seule forme par ID */
    getShape(shapeId: number): Observable<Shape> {
        // Route API: GET /api/admin/shapes/{id}
        return this.http.get<Shape>(`${this.apiUrl}/${shapeId}`);
    }

    /** POST: Crée une nouvelle forme */
    createShape(shapeData: any): Observable<Shape> {
        // Route API: POST /api/admin/shapes
        return this.http.post<Shape>(this.apiUrl, shapeData);
    }

    /** PUT/PATCH: Met à jour une forme existante */
    updateShape(shapeId: number, shapeData: any): Observable<Shape> {
        // Route API: PUT/PATCH /api/admin/shapes/{id}
        return this.http.put<Shape>(`${this.apiUrl}/${shapeId}`, shapeData);
    }

    /** DELETE: Supprime une forme */
    deleteShape(shapeId: number): Observable<void> {
        // Route API: DELETE /api/admin/shapes/{id}
        return this.http.delete<void>(`${this.apiUrl}/${shapeId}`);
    }
}