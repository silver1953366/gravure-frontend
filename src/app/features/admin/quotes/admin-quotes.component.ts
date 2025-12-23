import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe, SlicePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Nécessaire pour [(ngModel)]
import { TransactionService } from '../../../core/services/transaction.service';
import { Quote } from '../../../core/models/client/quotes/quote.model';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe, 
    DecimalPipe, 
    UpperCasePipe, 
    SlicePipe, 
    RouterModule, 
    FormsModule
  ],
  templateUrl: './admin-quotes.component.html',
  styleUrls: ['./admin-quotes.component.css']
})
export class AdminQuotesComponent implements OnInit {
  // --- Données originales ---
  quotes: Quote[] = [];
  
  // --- Filtres et Tri ---
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'desc'; // Tri par date décroissant par défaut
  
  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 8;

  // --- États UI ---
  isLoading = true;
  isProcessing = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  /**
   * Charge les données depuis le service
   */
  loadQuotes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.transactionService.getAllQuotes().subscribe({
      next: (data: Quote[]) => {
        this.quotes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement devis:', err);
        this.error = 'Impossible de charger les devis. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // LOGIQUE DE FILTRAGE ET TRI (Calculée)
  // ==========================================

  /**
   * Retourne la liste filtrée par nom/email et triée par date
   */
  get filteredQuotes(): Quote[] {
    // 1. Filtrage
    let result = this.quotes.filter(q => {
      const search = this.searchTerm.toLowerCase();
      const nameMatch = q.client_details?.name?.toLowerCase().includes(search);
      const emailMatch = q.client_details?.email?.toLowerCase().includes(search);
      const idMatch = q.id?.toString().includes(search);
      return nameMatch || emailMatch || idMatch;
    });

    // 2. Tri par date (created_at)
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }

  /**
   * Retourne uniquement les éléments de la page actuelle
   */
  get paginatedQuotes(): Quote[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredQuotes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcul du nombre total de pages
   */
  get totalPages(): number {
    const count = this.filteredQuotes.length;
    return count > 0 ? Math.ceil(count / this.itemsPerPage) : 1;
  }

  /**
   * Inverse l'ordre de tri
   */
  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.currentPage = 1; // On revient à la page 1 lors du tri
  }

  // ==========================================
  // ACTIONS ADMINISTRATIVES
  // ==========================================

  viewDetail(id: number): void {
    this.router.navigate(['/admin/quotes', id]);
  }

  onCalculateQuote(quote: Quote): void {
    const promptValue = prompt(
      `Fixer le prix final pour le devis #${quote.id}\nClient: ${quote.client_details.name}`,
      quote.final_price_fcfa.toString()
    );

    if (promptValue === null || promptValue.trim() === '') return;

    const finalPrice = parseFloat(promptValue);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      alert("Veuillez saisir un montant valide.");
      return;
    }

    this.executeStatusUpdate(quote.id!, {
      final_price_fcfa: finalPrice,
      status: 'calculated'
    }, `Prix fixé : ${finalPrice} FCFA pour le devis #${quote.id}.`);
  }

  onRejectQuote(id: number | undefined): void {
    if (!id || !confirm("Rejeter ce devis ?")) return;
    this.executeStatusUpdate(id, { status: 'rejected' }, `Devis #${id} rejeté.`);
  }

  onDeleteQuote(id: number | undefined): void {
    if (!id || !confirm("Supprimer définitivement ?")) return;
    this.isProcessing = true;
    this.transactionService.deleteQuote(id).subscribe({
      next: () => {
        this.showFeedback(`Devis #${id} supprimé.`);
        this.loadQuotes();
      },
      error: () => {
        this.error = "Erreur de suppression.";
        this.isProcessing = false;
      }
    });
  }

  private executeStatusUpdate(id: number, payload: any, message: string): void {
    this.isProcessing = true;
    this.transactionService.updateQuote(id, payload).subscribe({
      next: () => {
        this.showFeedback(message);
        this.loadQuotes(); 
      },
      error: () => {
        this.error = "L'opération a échoué.";
        this.isProcessing = false;
      }
    });
  }

  private showFeedback(message: string): void {
    this.successMessage = message;
    this.isProcessing = false;
    setTimeout(() => this.successMessage = null, 5000);
  }
}