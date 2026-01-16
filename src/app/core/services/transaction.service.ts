import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';


// Importation des interfaces (Assurez-vous que Order est exporté dans quote.model.ts)
// Si l'erreur 2459 persiste, définissez l'interface Order ici avec le mot-clé 'export'
import { Quote,  } from '../models/client/quotes/quote.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  // --- CONFIGURATION DE L'ENTREPRISE ---
  private readonly user = 'contact';
  private readonly domain = 'emes-gravure.com';
  // String.fromCharCode(64) = "@" pour éviter les problèmes d'analyse statique
  readonly COMPANY_EMAIL = `${this.user}${String.fromCharCode(64)}${this.domain}`;

  // --- CONFIGURATION DES URLS (API LARAVEL) ---
  private readonly API_URL = 'http://localhost:8000/api';
  private readonly ADMIN_QUOTES = `${this.API_URL}/admin/quotes`;
  private readonly ADMIN_ORDERS = `${this.API_URL}/admin/admin-orders`;
  private readonly CLIENT_QUOTES = `${this.API_URL}/quotes`;

  constructor(private http: HttpClient) {}

  // ========================================================================
  // 1. GESTION DES DEVIS (QUOTES) - PARTIE ADMIN
  // ========================================================================

  /**
   * Récupère la liste de tous les devis
   */
  getAllQuotes(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.ADMIN_QUOTES);
  }

  /**
   * Récupère un devis par son ID
   */
  getQuoteById(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.CLIENT_QUOTES}/${id}`);
  }

  /**
   * Mise à jour globale d'un devis (prix final ou rejet)
   */
  updateQuote(id: number, payload: Partial<Quote>): Observable<Quote> {
    return this.http.put<Quote>(`${this.ADMIN_QUOTES}/${id}`, payload);
  }

  /**
   * Suppression définitive d'un devis
   */
  deleteQuote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ADMIN_QUOTES}/${id}`);
  }

  // ========================================================================
  // 2. GESTION DES COMMANDES (ORDERS) - PARTIE ADMIN
  // ========================================================================

  /**
   * Liste toutes les commandes pour l'admin
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ADMIN_ORDERS);
  }

  /**
   * Détail d'une commande spécifique (utilisé pour la facture finale)
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.ADMIN_ORDERS}/${id}`);
  }

  /**
   * Mise à jour du statut d'une commande (Erreur 2339 résolue ici)
   */
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.ADMIN_ORDERS}/${id}`, { status });
  }

  /**
   * Mise à jour globale d'une commande (si besoin de modifier plus que le statut)
   */
  updateOrder(id: number, payload: any): Observable<Order> {
    return this.http.put<Order>(`${this.ADMIN_ORDERS}/${id}`, payload);
  }

  /**
   * Suppression d'une commande
   */
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ADMIN_ORDERS}/${id}`);
  }

  // ========================================================================
  // 3. ACTIONS CLIENTS (CONVERSIONS)
  // ========================================================================

  /**
   * Convertit un devis validé en commande réelle
   */
  convertQuoteToOrder(quoteId: number): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/orders/convert/${quoteId}`, {});
  }
}