// src/app/features/admin/quotes/admin-quote-detail/admin-quote-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionService, Quote } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-admin-quote-detail',
  standalone: true,
  // Ajout des modules nécessaires
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, RouterModule],
  templateUrl: './admin-quote-detail.component.html',
  styleUrls: ['./admin-quote-detail.component.css']
})
export class AdminQuoteDetailComponent implements OnInit {

    quote: Quote | null = null;
    isLoading = true;
    error: string | null = null;
    quoteId: number | null = null;
    successMessage: string | null = null;
    isProcessing = false;

    constructor(
        private route: ActivatedRoute,
        public router: Router, // 'public' pour l'accès dans le template HTML
        private transactionService: TransactionService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                this.quoteId = +idParam;
                this.loadQuoteDetail(this.quoteId);
            } else {
                this.error = "ID du devis manquant.";
                this.isLoading = false;
            }
        });
    }

    /**
     * Charge les détails du devis par ID.
     */
    loadQuoteDetail(id: number): void {
        this.isLoading = true;
        this.error = null;
        this.transactionService.getQuoteById(id).subscribe({
            next: (data: Quote) => { 
                this.quote = data;
                this.isLoading = false;
            },
            error: (err: any) => { 
                this.error = "Impossible de charger le détail du devis. " + err.message;
                this.isLoading = false;
            }
        });
    }

    /**
     * Convertit le devis en commande depuis la page de détail.
     */
    onConvertQuote(): void {
        if (!this.quote || this.quote.status !== 'submitted' || !this.quoteId) return;

        if (!confirm(`Confirmez-vous la conversion du devis #${this.quoteId} en COMMANDE ?`)) {
            return;
        }

        this.isProcessing = true;
        this.error = null;

        this.transactionService.convertQuoteToOrder(this.quoteId).subscribe({
            next: (order) => {
                this.successMessage = `Devis #${this.quoteId} converti en Commande #${order.id}!`;
                this.isProcessing = false;
                // Recharger pour mettre à jour le statut du devis à 'ordered'
                this.loadQuoteDetail(this.quoteId!); 
            },
            error: (err) => {
                this.error = `Erreur lors de la conversion: ${err.message}`;
                this.isProcessing = false;
            }
        });
    }

    /**
     * Supprime le devis depuis la page de détail.
     */
    onDeleteQuote(): void {
        if (!this.quoteId) return;

        if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce devis ?")) {
            return;
        }

        this.transactionService.deleteQuote(this.quoteId).subscribe({
            next: () => {
                alert(`Devis #${this.quoteId} supprimé avec succès.`);
                this.router.navigate(['/admin/quotes']); // Retourner à la liste
            },
            error: (err) => {
                this.error = `Impossible de supprimer le devis: ${err.message}`;
            }
        });
    }
}