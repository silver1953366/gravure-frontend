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

// Typage minimal pour le payload sans fichier
type ShapePayload = {
    name: string;
    slug?: string;
    description?: string;
    is_active?: boolean;
}; 

@Injectable({
    providedIn: 'root'
})
export class ShapeService {
    private readonly apiUrl = `${environment.apiUrl}/admin/shapes`; 

    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de toutes les formes */
    getShapes(): Observable<Shape[]> {
        return this.http.get<Shape[]>(this.apiUrl);
    }
    
    /** GET: Récupère une seule forme par ID */
    getShape(shapeId: number): Observable<Shape> {
        return this.http.get<Shape>(`${this.apiUrl}/${shapeId}`);
    }

    /** POST: Crée une nouvelle forme (accepte FormData ou ShapePayload) */
    createShape(shapeData: FormData | ShapePayload): Observable<Shape> {
        return this.http.post<Shape>(this.apiUrl, shapeData);
    }

    /** POST: Met à jour une forme existante (utilise POST pour FormData + _method=PUT) */
    updateShape(shapeId: number, shapeData: FormData | Partial<ShapePayload>): Observable<Shape> {
        // La méthode PUT/PATCH est gérée dans le composant via FormData.append('_method', 'PUT').
        return this.http.post<Shape>(`${this.apiUrl}/${shapeId}`, shapeData);
    }

    /** DELETE: Supprime une forme */
    deleteShape(shapeId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${shapeId}`);
    }
}