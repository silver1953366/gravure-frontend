import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote, QuotePayload, QuoteEstimate } from '../../../core/models/client/quotes/quote.model'; 
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ClientQuoteService {
  // Route protégée pour les actions liées au compte utilisateur
  private apiUrl = `${environment.apiUrl}/quotes`; 
  
  // Route publique pour l'accès au catalogue et aux estimations sans connexion obligatoire
  private catalogUrl = `${environment.apiUrl}/catalog`; 

  private http = inject(HttpClient);

  /**
   * Récupère la liste des devis de l'utilisateur connecté.
   * Le backend filtre automatiquement via auth:sanctum.
   */
  getQuotes(sortBy: 'recent' | 'oldest' = 'recent'): Observable<Quote[]> {
    let params = new HttpParams();
    if (sortBy && sortBy !== 'recent') {
        params = params.set('sort_by', sortBy); 
    }
    return this.http.get<Quote[]>(this.apiUrl, { params });
  }

  /**
   * Récupère les détails complets d'un devis spécifique.
   */
  getQuoteDetails(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/${id}`);
  }

  /**
   * Estime le prix en temps réel.
   * Appelle POST /api/catalog/quotes/estimate
   * Le backend retourne un objet contenant 'cost_details'.
   */
  estimateQuote(payload: QuotePayload): Observable<QuoteEstimate> {
    return this.http.post<QuoteEstimate>(`${this.catalogUrl}/quotes/estimate`, payload);
  }

  /**
   * Soumet et enregistre définitivement la demande de devis en base de données.
   * @param payload Doit contenir client_details, material_id, shape_id, quantity, etc.
   */
  submitQuote(payload: any): Observable<{ message: string, quote: Quote }> {
    // Cette route requiert d'être authentifié (Middleware auth:sanctum côté Laravel)
    return this.http.post<{ message: string, quote: Quote }>(this.apiUrl, payload);
  }
  
  /**
   * Met à jour un devis existant (par exemple si le statut est encore DRAFT).
   */
  updateQuote(id: number, payload: Partial<QuotePayload>): Observable<{ message: string, quote: Quote }> {
      return this.http.put<{ message: string, quote: Quote }>(`${this.apiUrl}/${id}`, payload);
  }

  /**
   * Supprime un devis.
   */
  deleteQuote(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}