import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; 

import { ClientQuoteService } from '../../../../core/services/client/client-quote.service'; 
import { OrderService } from '../../../../core/services/client/order.service'; 
import { Quote } from '../../../../core/models/client/quotes/quote.model';
import { Attachment } from '../../../../core/models/client/quotes/attachment.model';

// Interface pour la conversion (si non exportée dans order.model.ts)
interface ConvertToOrderPayload {
    shipping_address: {
        street: string;
        city: string;
        postal_code: string;
        country: string;
    };
}

@Component({
    selector: 'app-quote-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, DecimalPipe], 
    templateUrl: './quote-detail.component.html',
    styleUrls: ['./quote-detail.component.css']
})
export class QuoteDetailComponent implements OnInit {
    private quoteService = inject(ClientQuoteService);
    private orderService = inject(OrderService); 
    private route = inject(ActivatedRoute);
    private router = inject(Router); 
    private destroyRef = inject(DestroyRef); 

    quote = signal<Quote | null>(null);
    isLoading = signal(false);

    private attachmentBaseUrl = 'http://localhost:8000/api/attachments';


    ngOnInit(): void {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (!id) {
                    return of(null as Quote | null);
                }
                this.isLoading.set(true);
                return this.quoteService.getQuoteDetails(+id).pipe(
                    catchError(err => {
                        console.error('Erreur chargement détails du devis:', err);
                        return of(null);
                    })
                );
            }),
            takeUntilDestroyed(this.destroyRef) 
        ).subscribe({
            next: (data) => {
                this.quote.set(data);
                this.isLoading.set(false);
            }
        });
    }

    /** Définit la classe CSS du statut */
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

    /** Génère l'URL de téléchargement pour un fichier joint */
    getAttachmentDownloadUrl(attachmentId: number): string {
        return `${this.attachmentBaseUrl}/${attachmentId}/download`; 
    }

    /** Logique de conversion du devis en commande */
    convertQuote(): void {
        const currentQuote = this.quote();
        if (!currentQuote || currentQuote.status !== 'calculated') {
            console.error('Conversion impossible: Statut invalide.');
            return;
        }
        
        if (!confirm(`Confirmez-vous la conversion du devis n°${currentQuote.reference} en commande pour un total de ${currentQuote.final_price_fcfa} FCFA ?`)) {
            return;
        }

        const dummyPayload: ConvertToOrderPayload = {
            shipping_address: {
                street: '123 Rue de la Gravure',
                city: 'Libreville',
                postal_code: '01BP', 
                country: 'Gabon'
            }
        };

        this.isLoading.set(true);

        this.orderService.convertQuoteToOrder(currentQuote.id, dummyPayload).subscribe({
            next: (response) => {
                alert(response.message);
                this.router.navigate(['/client/orders', response.order.id]);
            },
            error: (err) => {
                console.error("Erreur de conversion en commande:", err);
                alert(`Échec de la conversion: ${err.error?.message || 'Erreur serveur.'}`);
                this.isLoading.set(false);
            }
        });
    }
}