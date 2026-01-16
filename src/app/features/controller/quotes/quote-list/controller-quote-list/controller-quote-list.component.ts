// src/app/features/controller/quotes/quote-list/controller-quote-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ControllerQuoteService, Quote } from '../../controller-quote.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-quote-list',
    templateUrl: './controller-quote-list.component.html',
    styleUrls: ['./controller-quote-list.component.css']
})
export class ControllerQuoteListComponent implements OnInit {
    
    quotes: Quote[] = [];
    isLoading = true;
    error: string | null = null;
    
    public readonly STATUS_CALCULATED = 'CALCULATED';

    constructor(
        private quoteService: ControllerQuoteService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchQuotes();
    }

    fetchQuotes(): void {
        this.isLoading = true;
        this.quoteService.getQuotes().subscribe({
            next: (data) => {
                this.quotes = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des devis", err);
                this.error = "Impossible de charger la liste des devis.";
                this.isLoading = false;
            }
        });
    }

    goToDetail(id: number): void {
        this.router.navigate(['/controller/quotes', id]);
    }
}