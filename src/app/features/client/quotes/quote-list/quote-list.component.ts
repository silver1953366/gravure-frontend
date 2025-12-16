import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ClientQuoteService } from '../../../../core/services/client/client-quote.service'; 
import { Quote } from '../../../../core/models/client/quotes/quote.model'; 

@Component({
    selector: 'app-quote-list',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, DecimalPipe], 
    templateUrl: './quote-list.component.html',
    styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent implements OnInit {
    
    private quoteService = inject(ClientQuoteService);
    private destroyRef = inject(DestroyRef); 

    quotes = signal<Quote[]>([]);
    isLoading = signal(false);
    errorOccurred = signal(false);
    currentSort = signal<'recent' | 'oldest'>('recent');

    ngOnInit(): void {
        this.fetchQuotes(this.currentSort());
    }

    /**
     * Récupère la liste des devis depuis le service.
     */
    fetchQuotes(sortBy: 'recent' | 'oldest'): void {
        this.isLoading.set(true);
        this.errorOccurred.set(false);
        this.currentSort.set(sortBy);

        this.quoteService.getQuotes(sortBy).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError(error => {
                console.error("Erreur lors de la récupération des devis", error);
                this.errorOccurred.set(true); 
                this.isLoading.set(false); 
                return of([]); 
            })
        ).subscribe({
            next: (data) => {
                this.quotes.set(data);
                this.isLoading.set(false);
            },
        });
    }

    /**
     * Gère le changement de l'option de tri dans le template.
     */
    onSortChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const sortBy = selectElement.value as 'recent' | 'oldest';
        this.fetchQuotes(sortBy);
    }

    /**
     * Retourne la classe CSS appropriée pour l'affichage du statut.
     */
    getStatusColor(status: Quote['status']): string {
        switch (status) {
            case 'draft': return 'gray';
            case 'sent': return 'blue';
            case 'calculated': return 'green'; 
            case 'ordered': return 'purple';
            case 'rejected': return 'red';
            case 'archived': return 'orange';
            default: return 'gray';
        }
    }
}