import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

// Services
import { InventoryService, InventoryItem } from '../inventory.service';
import { PricingService } from '../../pricing/pricing.service';

// Modèles
import { MaterialDimension } from '../../../../core/models/category.model'; 

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
    
    catalogItems: MaterialDimension[] = [];
    existingInventory: InventoryItem[] = [];
    
    private routeSubscription!: Subscription;

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private pricingService: PricingService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.inventoryForm = this.fb.group({
            material_dimension_id: ['', [Validators.required]],
            stock_quantity: [0, [Validators.required, Validators.min(0)]],
            reserved_quantity: [{ value: 0, disabled: true }, [Validators.required]], 
            minimum_threshold: [5, [Validators.required, Validators.min(0)]],
            price_per_unit: [0, [Validators.required, Validators.min(0)]],
        });
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.onCatalogItemChange(); // Initialise l'écouteur de prix

        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            if (params['id']) {
                this.currentItemId = +params['id'];
                this.isEditMode = true;
                this.loadItemData();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
    }

    loadInitialData(): void {
        this.isLoading = true;
        forkJoin({
            catalog: this.pricingService.getMaterialDimensions(),
            inventory: this.inventoryService.getInventory()
        }).subscribe({
            next: (results) => {
                this.catalogItems = results.catalog;
                this.existingInventory = results.inventory;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur chargement données", err);
                this.isLoading = false;
            }
        });
    }

    /**
     * Pré-remplit le prix unitaire dès qu'une configuration est sélectionnée
     */
    onCatalogItemChange(): void {
        this.inventoryForm.get('material_dimension_id')?.valueChanges.subscribe(id => {
            // On ne pré-remplit qu'en mode création
            if (id && !this.isEditMode) {
                const selectedItem = this.catalogItems.find(item => item.id === Number(id));
                if (selectedItem) {
                    this.inventoryForm.patchValue({
                        price_per_unit: selectedItem.unit_price_fcfa || 0
                    });
                }
            }
        });
    }

    get filteredCatalogItems(): MaterialDimension[] {
        if (this.isEditMode) return this.catalogItems;

        const inStockIds: number[] = this.existingInventory
            .map(item => item.material_dimension_id)
            .filter((id): id is number => id !== undefined);

        return this.catalogItems.filter(cat => 
            cat.id !== undefined && !inStockIds.includes(cat.id)
        );
    }

    loadItemData(): void {
        this.isLoading = true;
        this.inventoryService.getInventoryItem(this.currentItemId!).subscribe({
            next: (item: InventoryItem) => {
                this.patchForm(item);
                this.isLoading = false;
            },
            error: (err) => {
                this.router.navigate(['/admin/inventory']);
                this.isLoading = false;
            }
        });
    }

    patchForm(item: InventoryItem): void {
        this.inventoryForm.patchValue({
            material_dimension_id: item.material_dimension_id,
            stock_quantity: item.stock_quantity,
            reserved_quantity: item.reserved_quantity,
            minimum_threshold: item.minimum_threshold,
            price_per_unit: item.price_per_unit,
        });
        this.inventoryForm.get('material_dimension_id')?.disable();
    }

    onSubmit(): void {
        if (this.inventoryForm.invalid) {
            this.inventoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.apiErrors = {};
        
        const rawData = this.inventoryForm.getRawValue();

        const dataToSubmit: Partial<InventoryItem> = {
            material_dimension_id: Number(rawData.material_dimension_id),
            stock_quantity: Math.floor(Number(rawData.stock_quantity)),
            minimum_threshold: Math.floor(Number(rawData.minimum_threshold)),
            price_per_unit: Number(rawData.price_per_unit),
            reserved_quantity: Math.floor(Number(rawData.reserved_quantity || 0))
        };

        const request = this.isEditMode && this.currentItemId
            ? this.inventoryService.updateItem(this.currentItemId, dataToSubmit)
            : this.inventoryService.createItem(dataToSubmit);

        request.pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/admin/inventory']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422) {
                    this.apiErrors = err.error.errors;
                    if (this.apiErrors.material_dimension_id) {
                        this.apiErrors.general = "Cette configuration est déjà présente en stock.";
                    }
                } else {
                    this.apiErrors = { general: "Une erreur est survenue lors de l'enregistrement." };
                }
            }
        });
    }
}