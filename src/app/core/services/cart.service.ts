// src/app/core/services/cart.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs'; 
// CORRECTION : Le chemin standard depuis 'src/app/core/services' est souvent '../../environments/environment'
// Si ce chemin échoue, vous devrez vérifier si c'est '../../../environments/environment'
import { environment } from './../../environments/environment'; // Utilisation du chemin le plus probable
// Assurez-vous que Discount est importé pour le typage dans INITIAL_EMPTY_CART
import { Cart, CartItemPayload, Discount } from '../models/cart.model'; 

// --- Définition de l'état initial du panier ---
const INITIAL_EMPTY_CART: Cart = { 
    id: 0, 
    user_id: null, 
    // CORRECTION APPLIQUÉE : 'null' est désormais valide grâce à la modification de l'interface Cart
    session_token: null, 
    status: 'pending', 
    items: [], 
    subtotal_ht: 0, 
    discount: null, 
} as Cart; 

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    // Initialisation avec un panier VIDE (pour éliminer l'état "Chargement..." au démarrage)
    private cartSubject = new BehaviorSubject<Cart>(INITIAL_EMPTY_CART); 
    cart$ = this.cartSubject.asObservable(); 

    private readonly CART_TOKEN_KEY = 'cart_session_token'; 

    constructor() {
        this.loadCart().subscribe({
             error: (err) => console.error("Échec du chargement initial du panier", err)
        }); 
    }

    public getSessionToken(): string | null {
        return localStorage.getItem(this.CART_TOKEN_KEY);
    }

    public loadCart(): Observable<Cart> {
        return this.http.get<Cart>(`${this.API_URL}/cart`).pipe(
            tap(cart => {
                this.cartSubject.next(cart);
                
                if (cart.session_token) {
                    localStorage.setItem(this.CART_TOKEN_KEY, cart.session_token);
                } else {
                    localStorage.removeItem(this.CART_TOKEN_KEY); 
                }
            }),
             catchError(error => {
                console.warn("Impossible de charger le panier. Maintien de l'état vide.", error);
                this.cartSubject.next(INITIAL_EMPTY_CART);
                return of(error);
            })
        );
    }

    public addItem(payload: CartItemPayload): Observable<Cart> {
        return this.http.post<Cart>(`${this.API_URL}/cart`, payload).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }
    
    public updateItemQuantity(itemId: number, quantity: number): Observable<Cart> {
        return this.http.put<Cart>(`${this.API_URL}/cart/item/${itemId}`, { quantity }).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    public removeItem(itemId: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/cart/item/${itemId}`).pipe(
            tap(() => this.loadCart().subscribe()) 
        );
    }
    
    public convertToQuote(): Observable<any> {
        return this.http.post(`${this.API_URL}/cart/convert-to-quote`, {}).pipe(
            tap(() => this.clearCartData()) 
        );
    }
    
    public clearCartData(): void {
        localStorage.removeItem(this.CART_TOKEN_KEY);
        this.cartSubject.next(INITIAL_EMPTY_CART); 
    }
}