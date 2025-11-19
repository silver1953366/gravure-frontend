import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common'; // Ajout des Pipes pour le template
import { TransactionService,  } from '../../../core/services/transaction.service'; // Importe l'interface Quote corrigée
import{Quote} from '../../../core/models/client/quotes/quote.model';
@Component({
    selector: 'app-admin-quotes',
    standalone: true,
    imports: [CommonModule, DatePipe, DecimalPipe, UpperCasePipe], // Assurez-vous d'importer les pipes
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
     * [ADMIN ACTION] Calcule/Fixe le prix d'un devis (Statut SENT -> CALCULATED).
     */
    onCalculateQuote(quote: Quote): void {
        if (quote.status !== 'sent') {
            alert("Seuls les devis en statut 'SENT' peuvent être calculés.");
            return;
        }
        
        const finalPriceStr = prompt(`Entrez le prix final (FCFA) pour le devis #${quote.id}:`);
        const finalPrice = parseFloat(finalPriceStr || '');

        if (!finalPrice || finalPrice <= 0) {
            alert("Prix invalide.");
            return;
        }
        
        this.isProcessing = true;
        this.error = null;
        this.successMessage = null;

        // La propriété envoyée au service est 'final_price', le backend doit l'accepter
        this.transactionService.calculateQuote(quote.id, { final_price: finalPrice }).subscribe({
            next: () => { // updatedQuote n'est pas utilisé directement ici
                this.successMessage = `Devis #${quote.id} calculé (Prix: ${finalPrice} FCFA). Statut mis à jour à CALCULATED.`;
                this.isProcessing = false;
                this.loadQuotes(); 
            },
            error: (err) => {
                this.error = `Erreur lors du calcul du devis #${quote.id}.`;
                this.isProcessing = false;
                console.error('API Error:', err);
            }
        });
    }

    /**
     * [ADMIN ACTION] Rejette un devis (SENT/CALCULATED -> REJECTED).
     */
    onRejectQuote(id: number | undefined): void {
        if (!id || !confirm(`Êtes-vous sûr de vouloir REJETER le devis #${id} ?`)) {
            return;
        }

        this.isProcessing = true;
        this.error = null;
        this.successMessage = null;

        this.transactionService.rejectQuote(id).subscribe({
            next: () => {
                this.successMessage = `Devis #${id} rejeté avec succès.`;
                this.isProcessing = false;
                this.loadQuotes(); 
            },
            error: (err) => {
                this.error = `Erreur lors du rejet du devis #${id}.`;
                this.isProcessing = false;
                console.error('API Error:', err);
            }
        });
    }

    /**
     * Détermine si le bouton de suppression est désactivé.
     */
    isDeleteDisabled(quote: Quote): boolean {
        return quote.order_id !== null;
    }
}