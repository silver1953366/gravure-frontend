import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionService, Quote } from '../../../../core/services/transaction.service';

@Component({
    selector: 'app-admin-quote-detail',
    standalone: true,
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
    
    newFinalPrice: number | null = null; 

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
        // NOTE: Il faut ajouter la méthode getQuoteById(id: number): Observable<Quote>
        // dans votre TransactionService pour que ceci fonctionne.
        // Je vais assumer qu'elle existe.
        this.transactionService.getQuoteById(id).subscribe({
            next: (data: Quote) => { 
                this.quote = data;
                this.isLoading = false;
                this.newFinalPrice = data.final_price_fcfa > 0 ? data.final_price_fcfa : null;
            },
            error: (err: any) => { 
                this.error = "Impossible de charger le détail du devis.";
                this.isLoading = false;
            }
        });
    }
    
    /**
     * [ADMIN ACTION] Calcule/Fixe le prix d'un devis (SENT -> CALCULATED).
     */
    onCalculateQuote(): void {
        if (!this.quote || this.quote.status !== 'sent' || !this.quoteId || !this.newFinalPrice || this.newFinalPrice <= 0) {
            alert("Veuillez entrer un prix valide et s'assurer que le devis est 'SENT'.");
            return;
        }
        
        if (!confirm(`Confirmez-vous le calcul du prix final à ${this.newFinalPrice} FCFA pour le devis #${this.quoteId} ?`)) {
            return;
        }
        
        this.isProcessing = true;
        this.error = null;
        this.transactionService.calculateQuote(this.quoteId, { final_price: this.newFinalPrice }).subscribe({
            next: () => {
                this.successMessage = `Devis #${this.quoteId} calculé (Prix: ${this.newFinalPrice} FCFA). Statut mis à jour à CALCULATED.`;
                this.isProcessing = false;
                this.loadQuoteDetail(this.quoteId!); 
            },
            error: (err) => {
                this.error = `Erreur lors du calcul: ${err.message || 'Problème de communication API'}`;
                this.isProcessing = false;
            }
        });
    }

    /**
     * [ADMIN ACTION] Rejette un devis (SENT/CALCULATED -> REJECTED).
     */
    onRejectQuote(): void {
        if (!this.quoteId || !this.quote || (this.quote.status !== 'sent' && this.quote.status !== 'calculated')) return;

        if (!confirm(`Êtes-vous sûr de vouloir REJETER le devis #${this.quoteId} ?`)) {
            return;
        }

        this.isProcessing = true;
        this.error = null;
        this.transactionService.rejectQuote(this.quoteId).subscribe({
            next: () => {
                this.successMessage = `Devis #${this.quoteId} rejeté avec succès.`;
                this.isProcessing = false;
                this.loadQuoteDetail(this.quoteId!); 
            },
            error: (err) => {
                this.error = `Erreur lors du rejet: ${err.message || 'Problème de communication API'}`;
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
                this.error = `Impossible de supprimer le devis: ${err.message || 'Problème de communication API'}`;
            }
        });
    }
}