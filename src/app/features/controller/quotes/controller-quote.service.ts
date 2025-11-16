// src/app/features/controller/quotes/controller-quote.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Quote {
    id: number;
    user_id: number;
    status: 'DRAFT' | 'SENT' | 'CALCULATED' | 'ACCEPTED' | 'REJECTED';
    total_price: number;
    created_at: string;
    // Les devis contiennent généralement les détails des articles et des configurations.
    quote_items?: any[]; 
}

@Injectable({
    providedIn: 'root'
})
export class ControllerQuoteService {
    // Utilise le chemin API CLIENT/GLOBAL (/quotes), accessible au Controller pour la lecture (via Policy@before)
    private readonly apiUrl = `${environment.apiUrl}/quotes`; 
    
    constructor(private http: HttpClient) {}

    /** GET: Récupère la liste de tous les devis. */
    getQuotes(): Observable<Quote[]> {
        return this.http.get<Quote[]>(this.apiUrl);
    }

    /** GET: Récupère le détail d'un devis. */
    getQuoteDetail(id: number): Observable<Quote> {
        return this.http.get<Quote>(`${this.apiUrl}/${id}`);
    }
}