import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // <-- Import de HttpParams ajouté
import { Observable } from 'rxjs';
import { Quote, QuotePayload, QuoteEstimate } from '../../../core/models/client/quotes/quote.model'; 
import { environment } from '../../../environments/environment'; 


@Injectable({
  providedIn: 'root'
})
export class ClientQuoteService {
  private apiUrl = `${environment.apiUrl}/quotes`; 

  private http = inject(HttpClient);

  /**
   * Récupère la liste des devis de l'utilisateur avec une option de tri.
   * GET /api/quotes?sort_by=...
   */
  getQuotes(sortBy: 'recent' | 'oldest' = 'recent'): Observable<Quote[]> { // <--- CORRECTION APPLIQUÉE ICI
    let params = new HttpParams();

    if (sortBy && sortBy !== 'recent') {
        // Ajout du paramètre 'sort_by' si le tri est différent de la valeur par défaut du backend
        params = params.set('sort_by', sortBy); 
    }

    // Envoi des paramètres dans la requête
    return this.http.get<Quote[]>(this.apiUrl, { params: params });
  }

  /**
   * Récupère les détails d'un devis spécifique.
   * GET /api/quotes/{id}
   */
  getQuoteDetails(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/${id}`);
  }

  /**
   * Estime le prix total sans enregistrer le devis.
   * POST /api/quotes/estimate
   */
  estimateQuote(payload: QuotePayload): Observable<QuoteEstimate> {
    return this.http.post<QuoteEstimate>(`${this.apiUrl}/estimate`, payload);
  }

  /**
   * Soumet et enregistre un nouveau devis.
   * POST /api/quotes
   */
  submitQuote(payload: QuotePayload): Observable<{ message: string, quote: Quote }> {
    return this.http.post<{ message: string, quote: Quote }>(this.apiUrl, payload);
  }
  
  /**
   * Met à jour un devis existant (principalement utilisé pour les devis DRAFT par le client).
   * PUT/PATCH /api/quotes/{id}
   */
  updateQuote(id: number, payload: Partial<QuotePayload>): Observable<{ message: string, quote: Quote }> {
      return this.http.put<{ message: string, quote: Quote }>(`${this.apiUrl}/${id}`, payload);
  }
}