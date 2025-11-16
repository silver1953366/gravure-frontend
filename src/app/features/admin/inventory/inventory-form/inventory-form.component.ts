import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { InventoryService, InventoryItem } from '../inventory.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule], 
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent implements OnInit {
    
    inventoryForm: FormGroup;
    currentItemId: number | null = null;
    isEditMode = false;
    isLoading = false;
    apiErrors: any = {};
    
    // Déclarer ici les listes pour les select (ex: emplacements de stockage, matériaux) si besoin
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // Définition du formulaire avec validation
        this.inventoryForm = this.fb.group({
            reference: ['', [Validators.required, Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.maxLength(500)]],
            quantity: [0, [Validators.required, Validators.min(0)]],
            location: ['', [Validators.required, Validators.maxLength(100)]],
            price_per_unit: [0, [Validators.required, Validators.min(0)]],
            // Ajoutez ici d'autres champs si votre modèle le requiert
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.currentItemId = params['id'] ? +params['id'] : null;
            this.isEditMode = !!this.currentItemId;
            
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
        
        // Comme nous n'avons qu'une seule route GET /api/inventory, nous la chargeons et la filtrons.
        // Si votre backend a une route GET /api/admin/inventory/{id}, utilisez-la ici.
        this.inventoryService.getInventory().pipe(
            switchMap(items => {
                const item = items.find(i => i.id === this.currentItemId);
                if (item) {
                    this.patchForm(item);
                    return [item];
                }
                throw new Error("Article d'inventaire non trouvé");
            })
        ).subscribe({
            next: () => this.isLoading = false,
            error: (err) => {
                console.error("Erreur de chargement des données de l'inventaire:", err);
                this.router.navigate(['/admin/inventory']); 
            }
        });
    }

    patchForm(item: InventoryItem): void {
         this.inventoryForm.patchValue({
             reference: item.reference,
             description: item.description,
             quantity: item.quantity,
             location: item.location,
             price_per_unit: item.price_per_unit,
             // ... autres champs
         });
    }

    onSubmit(): void {
        if (this.inventoryForm.invalid) {
            this.inventoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        const data = this.inventoryForm.value;
        
        // Conversion des nombres au bon format si nécessaire (ex: float pour le prix)
        data.price_per_unit = parseFloat(data.price_per_unit); 

        // Choisir entre création et mise à jour
        const request = this.isEditMode && this.currentItemId
            ? this.inventoryService.updateItem(this.currentItemId, data)
            : this.inventoryService.createItem(data);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                // Rediriger vers la liste après succès
                this.router.navigate(['/admin/inventory']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422 && err.error.errors) {
                    this.apiErrors = err.error.errors;
                } else {
                    this.apiErrors = { general: "Une erreur inattendue est survenue lors de la sauvegarde." };
                }
                console.error("Erreur API:", err);
            }
        });
    }
}