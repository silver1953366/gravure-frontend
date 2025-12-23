import { Component, OnInit, signal, inject, DestroyRef, LOCALE_ID, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ClientQuoteService } from '../../../../core/services/client/client-quote.service'; 
import { Quote, QuoteStatus } from '../../../../core/models/client/quotes/quote.model'; 

registerLocaleData(localeFr);

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe], 
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent implements OnInit {
  private quoteService = inject(ClientQuoteService);
  private destroyRef = inject(DestroyRef); 

  // États réactifs
  quotes = signal<Quote[]>([]);
  isLoading = signal(false);
  errorOccurred = signal(false);
  currentSort = signal<'recent' | 'oldest'>('recent');
  searchQuery = signal('');

  // Logique de filtrage par NOM DE MATÉRIAU uniquement
  filteredQuotes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allQuotes = this.quotes();
    
    if (!query) return allQuotes;

    return allQuotes.filter(q => 
      (q.material?.name || '').toLowerCase().includes(query)
    );
  });

  // Libellés des statuts en français
  readonly STATUS_LABELS: Record<QuoteStatus, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    calculated: 'Prix calculé',
    ordered: 'Commandé',
    rejected: 'Refusé',
    archived: 'Archivé'
  };

  ngOnInit(): void {
    this.fetchQuotes(this.currentSort());
  }

  fetchQuotes(sortBy: 'recent' | 'oldest'): void {
    this.isLoading.set(true);
    this.errorOccurred.set(false);
    this.currentSort.set(sortBy);

    this.quoteService.getQuotes(sortBy).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.errorOccurred.set(true);
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe(data => {
      this.quotes.set(data);
      this.isLoading.set(false);
    });
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.fetchQuotes(select.value as 'recent' | 'oldest');
  }

  getStatusClass(status: QuoteStatus): string {
    return `status-${status}`;
  }
}