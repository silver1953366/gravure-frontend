// src/app/features/admin/discounts/discounts.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'; 
import { FormsModule, NgForm } from '@angular/forms'; 
// 🛑 IMPORT DE L'INTERFACE CORRIGÉE DEPUIS LE SERVICE
import { DiscountsService, Discount } from './discount.service'; 


@Component({
  selector: 'app-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe,],
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.css']
})
export class DiscountsComponent implements OnInit {

    // --- Data Properties ---
    discounts: Discount[] = [];
    isLoading: boolean = false;
    error: string | null = null;
    successMessage: string | null = null;

    // --- Form State ---
    isCreating: boolean = false;
    isEditing: boolean = false;
    
    newDiscount: Discount = this.getEmptyDiscount(); 
    selectedDiscount: Discount | null = null; 

    constructor(private discountsService: DiscountsService) {}

    ngOnInit(): void {
        this.loadDiscounts();
    }

    // --- Getters & Helpers ---

    get currentDiscount(): Discount {
        // Retourne l'objet à lier au formulaire (newDiscount ou selectedDiscount)
        return this.isCreating ? this.newDiscount : (this.selectedDiscount || this.getEmptyDiscount());
    }

    getTypeLabel(type: 'percentage' | 'fixed'): string {
        return type === 'percentage' ? 'Pourcentage (%)' : 'Montant Fixe';
    }

    private getEmptyDiscount(): Discount {
        return {
            id: null, // number | null
            name: '',
            code: '',
            type: 'percentage',
            value: 0,
            min_order_amount: null,
            expires_at: null,
            is_active: true
        };
    }

    clearMessages(): void {
        this.error = null;
        this.successMessage = null;
    }

    // --- Opérations d'Initialisation et de Chargement ---

    loadDiscounts(): void {
        this.isLoading = true;
        this.error = null;
        
        this.discountsService.getAllDiscounts().subscribe({
            next: (data) => {
                this.discounts = data; // Assignation compatible grâce à la correction de l'interface
                this.isLoading = false;
            },
            error: (err) => {
                this.error = "Erreur lors du chargement des réductions. Détail: " + (err.message || err.statusText);
                this.isLoading = false;
            }
        });
    }


    // --- Logique du Formulaire (Création/Édition/Annulation) ---

    startCreation(): void {
        this.isEditing = false;
        this.isCreating = true;
        this.newDiscount = this.getEmptyDiscount();
        this.selectedDiscount = null;
        this.clearMessages();
    }

    startEditing(discount: Discount): void {
        this.isCreating = false;
        this.isEditing = true;
        this.selectedDiscount = { ...discount }; // Clonage pour l'édition
        this.newDiscount = this.getEmptyDiscount();
        this.clearMessages();
    }

    cancelOperation(): void {
        this.isCreating = false;
        this.isEditing = false;
        this.newDiscount = this.getEmptyDiscount();
        this.selectedDiscount = null;
        this.clearMessages();
    }

    saveDiscount(form: NgForm): void { 
        if (form.invalid) {
            this.error = "Veuillez remplir tous les champs requis correctement.";
            return;
        }

        const discountData = this.currentDiscount;
        this.clearMessages();

        if (this.isCreating) {
            this.discountsService.createDiscount(discountData).subscribe({
                next: () => {
                    this.successMessage = "Réduction créée avec succès.";
                    this.loadDiscounts();
                    this.cancelOperation();
                },
                error: (err) => {
                    this.error = "Erreur lors de la création de la réduction. Détail: " + (err.error?.message || err.statusText);
                }
            });
        } else if (this.isEditing && discountData.id !== null) {
            // L'ID est garanti d'être un number ici puisque c'est une édition
            this.discountsService.updateDiscount(discountData.id as number, discountData).subscribe({ 
                next: () => {
                    this.successMessage = "Réduction mise à jour avec succès.";
                    this.loadDiscounts();
                    this.cancelOperation();
                },
                error: (err) => {
                    this.error = "Erreur lors de la mise à jour de la réduction. Détail: " + (err.error?.message || err.statusText);
                }
            });
        }
    }

    deleteDiscount(id: number): void {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la réduction #${id} ?`)) {
            return;
        }
        this.clearMessages();
        this.discountsService.deleteDiscount(id).subscribe({
            next: () => {
                this.successMessage = `Réduction #${id} supprimée.`;
                this.loadDiscounts();
            },
            error: (err) => {
                this.error = "Erreur lors de la suppression de la réduction. Détail: " + (err.error?.message || err.statusText);
            }
        });
    }
}