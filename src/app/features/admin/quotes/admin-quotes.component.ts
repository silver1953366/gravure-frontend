// src/app/features/admin/quotes/admin-quotes.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Quote } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-quotes.component.html',
  styleUrls: ['./admin-quotes.component.css']
})
export class AdminQuotesComponent implements OnInit {

    quotes: Quote[] = [];
    isLoading = true;
    error: string | null = null;
    successMessage: string | null = null;
    isProcessing = false;

    constructor(private transactionService: TransactionService) {}

    ngOnInit(): void {
        this.loadQuotes();
    }

    /**
     * Charge tous les devis du système.
     */
    loadQuotes(): void {
        this.isLoading = true;
        this.error = null;
        this.transactionService.getAllQuotes().subscribe({
            next: (data) => {
                this.quotes = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Erreur lors du chargement des devis.';
                this.isLoading = false;
                console.error('API Error:', err);
            }
        });
    }

    /**
     * Supprime un devis.
     */
    onDeleteQuote(id: number | undefined): void {
        if (!id || !confirm("Êtes-vous sûr de vouloir supprimer définitivement ce devis ?")) {
            return;
        }

        this.transactionService.deleteQuote(id).subscribe({
            next: () => {
                this.successMessage = `Devis #${id} supprimé avec succès.`;
                this.loadQuotes();
            },
            error: (err) => {
                this.error = `Impossible de supprimer le devis #${id}.`;
                console.error('API Error:', err);
            }
        });
    }

    /**
     * Convertit un devis en commande.
     */
    onConvertQuote(quote: Quote): void {
        if (quote.status !== 'submitted' || !confirm(`Confirmez-vous la conversion du devis #${quote.id} en COMMANDE ?`)) {
            return;
        }
        
        this.isProcessing = true;
        this.error = null;

        this.transactionService.convertQuoteToOrder(quote.id).subscribe({
            next: (order) => {
                this.successMessage = `Devis #${quote.id} converti en Commande #${order.id} avec succès!`;
                this.isProcessing = false;
                this.loadQuotes(); // Recharger pour mettre à jour le statut du devis
            },
            error: (err) => {
                this.error = `Erreur lors de la conversion du devis #${quote.id}.`;
                this.isProcessing = false;
                console.error('API Error:', err);
            }
        });
    }
}