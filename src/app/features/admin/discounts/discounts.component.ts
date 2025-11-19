import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; 
import { FormsModule, NgForm } from '@angular/forms'; 
import { DiscountsService, Discount } from './discount.service'; 
import { RouterModule } from '@angular/router'; // Ajout de RouterModule si vous utilisez des liens internes

@Component({
    selector: 'app-discounts',
    standalone: true,
    // Note : CurrencyPipe est importé, mais utilisez 'XOF' (Franc CFA) ou un pipe personnalisé
    imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterModule], 
    templateUrl: './discounts.component.html', // Pointé vers le template intégré ci-dessous
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
        return this.isCreating ? this.newDiscount : (this.selectedDiscount || this.getEmptyDiscount());
    }

    getTypeLabel(type: 'percentage' | 'fixed'): string {
        return type === 'percentage' ? 'Pourcentage (%)' : 'Montant Fixe (FCFA)';
    }

    private getEmptyDiscount(): Discount {
        return {
            id: null, 
            name: '',
            code: '',
            type: 'percentage',
            value: 0,
            min_order_amount: null,
            expires_at: null, // Sera un string de type 'YYYY-MM-DD' si rempli
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
                this.discounts = data;
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
        // Clonage des données et conversion de la date pour le formulaire HTML input type="date"
        this.selectedDiscount = { 
            ...discount, 
            // La date doit être au format 'YYYY-MM-DD' pour le champ input type="date"
            expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().split('T')[0] : null
        }; 
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
            // L'ID est garanti d'être un number ici
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