import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import { take, switchMap, catchError } from 'rxjs/operators';
import { InventoryService, InventoryItem } from '../inventory.service'; // Correction du chemin

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule], 
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent implements OnInit, OnDestroy {
    
    inventoryForm: FormGroup;
    currentItemId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // Définition du formulaire avec les champs du modèle Inventory
        this.inventoryForm = this.fb.group({
            // Champs liés au Material/Dimension (souvent requis pour l'identification)
            reference: ['', [Validators.required, Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.maxLength(500)]],
            location: ['', [Validators.required, Validators.maxLength(100)]],
            
            // Champs de la table Inventory
            stock_quantity: [0, [Validators.required, Validators.min(0)]], // Stock total physique
            reserved_quantity: [0, [Validators.required, Validators.min(0)]], // Stock déjà alloué
            minimum_threshold: [0, [Validators.required, Validators.min(0)]], // Seuil d'alerte
            price_per_unit: [0, [Validators.required, Validators.min(0)]],
            // Note: material_dimension_id est géré si vous liez ce formulaire à une sélection Material/Dimension
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentItemId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentItemId;
            
            // Mettre à jour le titre du formulaire
            document.title = this.isEditMode ? 'Modifier l\'Inventaire' : 'Ajouter un article';
            
            // En mode édition, charger les données
            if (this.isEditMode) {
                this.loadItemData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    loadItemData(): void {
        this.isLoading = true;
        
        // 🛑 Amélioration : Utiliser getInventoryItem si votre backend le permet 
        // ou conserver getInventory().pipe(switchMap(...)) si getInventory est le seul endpoint de lecture
        
        this.inventoryService.getInventoryItem(this.currentItemId!).subscribe({
            next: (item: InventoryItem) => {
                this.patchForm(item);
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des données de l'inventaire:", err);
                this.router.navigate(['/admin/inventory']); 
                this.isLoading = false;
            }
        });
    }

    patchForm(item: InventoryItem): void {
        this.inventoryForm.patchValue({
            reference: item.reference,
            description: item.description,
            location: item.location,
            // Champs de l'inventaire
            stock_quantity: item.stock_quantity,
            reserved_quantity: item.reserved_quantity,
            minimum_threshold: item.minimum_threshold,
            price_per_unit: item.price_per_unit,
        });
        
        // Sécurité: Si nous éditons, le stock réservé ne devrait pas pouvoir être modifié directement 
        // ou alors seulement par un super-admin et avec prudence.
        // Optionnel: Désactiver le champ reserved_quantity en mode édition
        // this.inventoryForm.get('reserved_quantity')?.disable(); 
    }

    onSubmit(): void {
        if (this.inventoryForm.invalid) {
            this.inventoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        const data = this.inventoryForm.getRawValue(); // Utiliser getRawValue si des champs sont désactivés
        
        // Assurer que les valeurs numériques sont des nombres
        data.stock_quantity = +data.stock_quantity; 
        data.reserved_quantity = +data.reserved_quantity;
        data.minimum_threshold = +data.minimum_threshold;
        data.price_per_unit = parseFloat(data.price_per_unit); 

        // Choisir entre création et mise à jour
        const request = this.isEditMode && this.currentItemId
            ? this.inventoryService.updateItem(this.currentItemId, data)
            : this.inventoryService.createItem(data);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                // Notification de succès ici
                this.router.navigate(['/admin/inventory']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422 && err.error.errors) {
                    this.apiErrors = err.error.errors;
                } else {
                    this.apiErrors = { general: `Une erreur inattendue est survenue lors de la sauvegarde. (${err.statusText})` };
                }
                console.error("Erreur API:", err);
            }
        });
    }
}