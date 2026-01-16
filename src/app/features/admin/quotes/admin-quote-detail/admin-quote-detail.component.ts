import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Quote, QuoteStatus } from '../../../../core/models/client/quotes/quote.model';

@Component({
  selector: 'app-admin-quote-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    DatePipe, 
    UpperCasePipe, 
    DecimalPipe
  ],
  templateUrl: './admin-quote-detail.component.html',
  styleUrls: ['./admin-quote-detail.component.css']
})
export class AdminQuoteDetailComponent implements OnInit {
  
  // --- Configuration ---
  readonly API_BASE_URL = 'http://localhost:8000'; 
  today: Date = new Date();

  // --- États Réactifs (Signals) ---
  quote = signal<Quote | null>(null);
  isLoading = signal<boolean>(true);
  isProcessing = signal<boolean>(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // --- Données temporaires ---
  newFinalPrice: number | null = null;
  quoteId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    // CHANGEMENT : 'public' est obligatoire pour l'accès depuis le HTML (Erreur 2341 corrigée)
    public transactionService: TransactionService 
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quoteId = +id;
      this.loadQuoteDetail(this.quoteId);
    } else {
      this.error.set("Identifiant du devis manquant.");
      this.isLoading.set(false);
    }
  }

  /**
   * Charge les données complètes du devis depuis l'API
   */
  loadQuoteDetail(id: number): void {
    this.isLoading.set(true);
    this.transactionService.getQuoteById(id).subscribe({
      next: (data: Quote) => {
        this.quote.set(data);
        if (data.final_price_fcfa) {
          this.newFinalPrice = data.final_price_fcfa;
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.error.set("Impossible de récupérer les détails du devis.");
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Action : Valider le prix définitif et notifier le client
   */
  onCalculateQuote(): void {
    if (!this.quoteId || !this.newFinalPrice || this.newFinalPrice <= 0) {
      alert("Veuillez saisir un montant valide.");
      return;
    }

    if (!confirm(`Voulez-vous valider ce montant de ${this.newFinalPrice} FCFA ?`)) return;

    this.isProcessing.set(true);
    
    // Payload typé avec QuoteStatus pour éviter l'erreur TS2345
    const payload: Partial<Quote> = { 
      final_price_fcfa: this.newFinalPrice,
      status: 'calculated' as QuoteStatus 
    };

    this.transactionService.updateQuote(this.quoteId, payload).subscribe({
      next: () => {
        this.showFeedback("Le prix a été validé et envoyé au client.");
        this.loadQuoteDetail(this.quoteId!);
      },
      error: () => this.handleError("Erreur lors de la mise à jour du prix.")
    });
  }

  /**
   * Action : Rejeter le devis
   */
  onRejectQuote(): void {
    if (!this.quoteId || !confirm("Voulez-vous vraiment rejeter ce devis ?")) return;

    this.isProcessing.set(true);
    this.transactionService.updateQuote(this.quoteId, { 
      status: 'rejected' as QuoteStatus 
    }).subscribe({
      next: () => {
        this.showFeedback("Le devis a été marqué comme rejeté.");
        this.loadQuoteDetail(this.quoteId!);
      },
      error: () => this.handleError("Échec de l'opération de rejet.")
    });
  }

  /**
   * Action : Suppression définitive du devis
   */
  onDeleteQuote(): void {
    if (!this.quoteId || !confirm("⚠️ Action irréversible. Supprimer définitivement ce devis ?")) return;

    this.isProcessing.set(true);
    this.transactionService.deleteQuote(this.quoteId).subscribe({
      next: () => {
        alert("Devis supprimé avec succès.");
        this.router.navigate(['/admin/quotes']);
      },
      error: () => this.handleError("Suppression impossible.")
    });
  }

  // --- GESTION DES FICHIERS (ATTACHMENTS) ---

  /**
   * Retourne l'URL complète pour accéder au fichier sur le serveur
   */
  getFileUrl(path: string | undefined): string {
    if (!path) return '';
    // Gère le cas où le chemin est déjà une URL complète ou doit être préfixé par storage
    return path.startsWith('http') ? path : `${this.API_BASE_URL}/storage/${path}`;
  }

  /**
   * Ouvre le fichier dans un nouvel onglet
   */
  viewFile(path: string | undefined): void {
    if (path) {
      window.open(this.getFileUrl(path), '_blank');
    }
  }

  /**
   * Force le téléchargement du fichier avec son nom d'origine
   */
  downloadFile(path: string, originalName: string): void {
    const url = this.getFileUrl(path);
    this.isProcessing.set(true);

    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        this.isProcessing.set(false);
      })
      .catch((err) => {
        console.error('Erreur download:', err);
        this.handleError("Erreur lors du téléchargement du fichier.");
      });
  }

  // --- HELPERS D'INTERFACE ---

  /**
   * Transforme le code statut en libellé lisible
   */
  getStatusLabel(status: string | undefined): string {
    const labels: Record<string, string> = {
      'sent': 'Nouveau / En attente',
      'calculated': 'Prix proposé',
      'ordered': 'Converti en commande',
      'rejected': 'Refusé',
      'archived': 'Archivé'
    };
    return labels[status || ''] || 'Statut inconnu';
  }

  private showFeedback(message: string): void {
    this.successMessage.set(message);
    this.isProcessing.set(false);
    // Efface le message de succès après 5 secondes
    setTimeout(() => this.successMessage.set(null), 5000);
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.isProcessing.set(false);
    // Efface le message d'erreur après 5 secondes
    setTimeout(() => this.error.set(null), 5000);
  }
}