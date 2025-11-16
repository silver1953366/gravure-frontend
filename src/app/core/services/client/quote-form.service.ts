import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définition d'une interface simple pour la réponse de l'API (à adapter)
interface QuoteResponse {
  message: string;
  quote_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuoteFormService { // Nom de la classe mis à jour
  // ADAPTEZ CETTE URL À VOTRE POINT DE TERMINAISON D'API DE DEVIS
  private apiUrl = 'http://localhost:8000/api/quotes'; 

  private http = inject(HttpClient);

  /**
   * Envoie les données du formulaire, y compris le fichier, à l'API.
   * Utilise FormData pour gérer les fichiers et les champs.
   */
  sendQuote(formData: FormData): Observable<QuoteResponse> {
    // HttpClient gère automatiquement l'en-tête 'Content-Type: multipart/form-data'
    // lorsque le corps de la requête est un objet FormData.
    return this.http.post<QuoteResponse>(`${this.apiUrl}/submit`, formData);
  }
}