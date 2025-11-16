import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ClientQuoteService } from '../../../../core/services/client/client-quote.service'; 
import { Quote } from '../../../../core/models/client/quotes/quote.model'; // Assurez-vous que ce chemin est correct

// L'import du service et du modèle est critique pour éviter les erreurs TS.

@Component({
    selector: 'app-quote-list',
    standalone: true,
    // Note: Utilisation des modules/pipes nécessaires pour le template
    imports: [CommonModule, RouterLink, DatePipe, DecimalPipe], 
    templateUrl: './quote-list.component.html',
    styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent implements OnInit {
    
    // Injections des dépendances
    private quoteService = inject(ClientQuoteService);
    private destroyRef = inject(DestroyRef); 

    // États du composant gérés par des Signaux
    quotes = signal<Quote[]>([]);
    isLoading = signal(false);

    ngOnInit(): void {
        this.fetchQuotes('recent'); // Chargement initial
    }

    /**
     * Récupère la liste des devis depuis le service.
     * @param sortBy Critère de tri ('recent' ou 'oldest').
     */
    fetchQuotes(sortBy: 'recent' | 'oldest'): void {
        this.isLoading.set(true);
        this.quoteService.getQuotes(sortBy).pipe(
            // takeUntilDestroyed assure que l'abonnement est automatiquement annulé lors de la destruction du composant
            takeUntilDestroyed(this.destroyRef),
            catchError(error => {
                console.error("Erreur lors de la récupération des devis", error);
                // Si une erreur se produit, renvoie un tableau vide pour ne pas bloquer l'interface
                return of([]); 
            })
        ).subscribe({
            next: (data) => {
                this.quotes.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Gère le changement de l'option de tri dans le template.
     * @param event L'événement de changement sur l'élément <select>.
     */
    onSortChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const sortBy = selectElement.value as 'recent' | 'oldest';
        this.fetchQuotes(sortBy);
    }

    /**
     * Retourne la classe CSS appropriée pour l'affichage du statut.
     * Cette méthode est utilisée dans le template HTML.
     * @param status Le statut du devis.
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