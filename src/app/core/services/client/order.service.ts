import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, Address } from '../../models/order.model'; // Import du nouveau modèle

// Structure des données à envoyer pour créer une commande
interface ConvertToOrderPayload {
  shipping_address: Address;
}

// Structure de la réponse attendue après création (selon OrderController::convertQuoteToOrder)
interface ConvertToOrderResponse {
  message: string;
  order: Order;
}


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // L'URL de base pour les commandes
  private apiUrl = 'http://localhost:8000/api/orders'; 

  private http = inject(HttpClient);

  /**
   * Convertit un devis (Quote) confirmé en Commande (Order).
   * C'est la méthode implémentant OrderController::convertQuoteToOrder(Request $request, Quote $quote).
   * * @param quoteId L'ID du devis à convertir.
   * @param payload Les données nécessaires à la commande (adresse de livraison).
   * @returns Un Observable contenant la nouvelle Order.
   */
  convertQuoteToOrder(quoteId: number, payload: ConvertToOrderPayload): Observable<ConvertToOrderResponse> {
    return this.http.post<ConvertToOrderResponse>(`${this.apiUrl}/convert/${quoteId}`, payload);
  }

  /**
   * Récupère la liste des commandes de l'utilisateur.
   * Implémente OrderController::index().
   */
  getOrders(): Observable<Order[]> {
    // Vous pouvez ajouter des paramètres de tri ici si nécessaire (ex: { params: { sort_by: 'oldest' } })
    return this.http.get<Order[]>(this.apiUrl);
  }
  
  /**
   * Récupère les détails d'une commande spécifique.
   * Implémente OrderController::show(Order $order).
   */
  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  // NOTE: Les méthodes de mise à jour/annulation seront ajoutées lorsque l'interface sera créée.
}