// src/app/features/client/quotes/quote-detail/quote-detail.component.ts

import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; 

import { ClientQuoteService } from '../../../../core/services/client/client-quote.service'; 
import { OrderService } from '../../../../core/services/client/order.service'; 
import { Quote, QuoteStatus } from '../../../../core/models/client/quotes/quote.model';

@Component({
    selector: 'app-quote-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, DecimalPipe, UpperCasePipe], 
    templateUrl: './quote-detail.component.html', 
    styleUrls: ['./quote-detail.component.css']
})
export class QuoteDetailComponent implements OnInit {
    // Services
    private readonly quoteService = inject(ClientQuoteService);
    private readonly orderService = inject(OrderService); 
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router); 
    private readonly destroyRef = inject(DestroyRef); 

    // États Réactifs (Signals)
    quote = signal<Quote | null>(null);
    isLoading = signal<boolean>(true);
    isSubmitting = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
    
    // URL de base pour les téléchargements
    private readonly apiBaseUrl = 'http://localhost:8000/api';

    ngOnInit(): void {
        this.fetchQuote();
    }

    /**
     * Charge les détails du devis depuis l'API
     */
    private fetchQuote(): void {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (!id) return of(null);
                this.isLoading.set(true);
                return this.quoteService.getQuoteDetails(+id).pipe(
                    catchError(err => {
                        this.errorMessage.set("Impossible de charger les détails du devis.");
                        return of(null);
                    })
                );
            }),
            takeUntilDestroyed(this.destroyRef) 
        ).subscribe(data => {
            this.quote.set(data);
            this.isLoading.set(false);
        });
    }

    /**
     * Redirige vers la commande liée si elle existe
     */
    viewRelatedOrder(): void {
        const orderId = this.quote()?.order_id;
        if (orderId) {
            this.router.navigate(['/client/orders', orderId]);
        }
    }

    /**
     * RÉCUPÉRATION DE LA DIMENSION RÉELLE
     * Priorité à la relation 'materialDimension' liée en base de données.
     */
    getDimensionDisplay(): string {
        const q = this.quote();
        if (!q) return 'N/A';

        // 1. On récupère le label depuis la relation MaterialDimension (Base de données)
        if (q.materialDimension?.dimension_label) {
            return q.materialDimension.dimension_label;
        }

        // 2. Fallback sur le champ texte brut si la relation n'est pas chargée
        return q.dimension_label || 'Dimension non spécifiée';
    }

    /**
     * Configuration visuelle des badges de statut
     */
    getStatusConfig(status: QuoteStatus) {
        const configs: Record<QuoteStatus, { label: string, class: string, icon: string }> = {
            'draft':      { label: 'Brouillon', class: 'status-gray', icon: 'fa-file-lines' },
            'sent':       { label: 'Envoyé', class: 'status-blue', icon: 'fa-paper-plane' },
            'calculated': { label: 'Prêt', class: 'status-green', icon: 'fa-calculator' },
            'ordered':    { label: 'Commandé', class: 'status-purple', icon: 'fa-circle-check' },
            'rejected':   { label: 'Refusé', class: 'status-red', icon: 'fa-circle-xmark' },
            'archived':   { label: 'Archivé', class: 'status-orange', icon: 'fa-box-archive' }
        };
        return configs[status] || configs['draft'];
    }

    getAttachmentUrl(attachmentId: number): string {
        return `${this.apiBaseUrl}/attachments/${attachmentId}/download`; 
    }

    /**
     * Convertit le devis en commande
     */
    convertQuote(): void {
        const currentQuote = this.quote();
        if (!currentQuote || currentQuote.status !== 'calculated') return;

        if (confirm(`Voulez-vous valider la commande pour le devis ${currentQuote.reference} ?`)) {
            this.isSubmitting.set(true);

            // On envoie l'adresse de livraison du client pour la commande
            const payload = {
                shipping_address: {
                    street: currentQuote.client_details.address || 'Libreville',
                    city: 'Libreville',
                    postal_code: '01BP',
                    country: 'Gabon'
                }
            };

            this.orderService.convertQuoteToOrder(currentQuote.id, payload).subscribe({
                next: (res) => {
                    // Optionnel : Mettre à jour le signal local pour refléter le changement de statut immédiatement
                    this.fetchQuote(); 
                    this.router.navigate(['/client/orders', res.order.id]);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    alert(err.error?.message || "Une erreur est survenue.");
                }
            });
        }
    }
}