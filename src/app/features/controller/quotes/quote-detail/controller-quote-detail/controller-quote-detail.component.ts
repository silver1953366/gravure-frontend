// src/app/features/controller/quotes/quote-detail/controller-quote-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ControllerQuoteService, Quote } from '../../controller-quote.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-quote-detail',
    templateUrl: './controller-quote-detail.component.html',
    styleUrls: ['./controller-quote-detail.component.css']
})
export class ControllerQuoteDetailComponent implements OnInit {
    
    quote: Quote | null = null;
    isLoading = true;
    error: string | null = null;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private quoteService: ControllerQuoteService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.error = "ID de devis manquant.";
                    return of(null);
                }
                this.isLoading = true;
                this.error = null;
                return this.quoteService.getQuoteDetail(+id);
            })
        ).subscribe({
            next: (data) => {
                this.quote = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement du devis", err);
                this.error = "Impossible de charger les détails du devis.";
                this.isLoading = false;
            }
        });
    }

    onBack(): void {
        this.router.navigate(['/controller/quotes']);
    }
}