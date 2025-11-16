import { Component, OnInit, signal, output, input, computed, Signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute } from '@angular/router'; 

// =================================================================
// 1. MODÈLES DE DONNÉES
// =================================================================

export interface Material {
    id: number;
    name: string;
    category_id: number;
    color?: string;
    image_url?: string;
    description?: string;
}

export interface Shape {
    id: number;
    name: string;
    image_url: string;
}

export interface MaterialDimension {
    id: number;
    material_id: number;
    shape_id: number;
    dimension_label: string;
    unit_price_fcfa: number;
    material?: Material;
    shape?: Shape;
}

interface FixationOption {
    id: number;
    name: string;
    icon: string;
    price_modifier: number;
}

interface TextContent {
    content: string;
    font: string;
    size: string;
}

interface BorderOptions {
    type: 'simple' | 'decorative' | null;
    shapeId: number | null; 
    color: string;
}


// =================================================================
// 2. DONNÉES SIMULÉES (Mises à jour pour inclure toutes les formes)
// =================================================================

const MOCK_MATERIALS: Material[] = [
    { id: 101, name: 'Acier Inox 304', category_id: 1, color: '#A0A0A0', image_url: 'assets/inox.jpg', description: 'Résistance supérieure à la corrosion.' },
    { id: 102, name: 'Aluminium 6061', category_id: 2, color: '#C0C0C0', image_url: 'assets/alu.jpg', description: 'Léger et facile à usiner.' },
    { id: 201, name: 'Laiton', category_id: 3, color: '#D4AF37', image_url: 'assets/laiton.jpg', description: 'Aspect esthétique, bonne conductivité.' },
];

const MOCK_SHAPES: Shape[] = [
    // Toutes les formes demandées sont incluses
    { id: 1, name: 'Rectangulaire', image_url: 'assets/shape-rectangle.png' }, 
    { id: 2, name: 'Carré', image_url: 'assets/shape-square.png' }, 
    { id: 3, name: 'Triangle', image_url: 'assets/shape-triangle.png' }, 
    { id: 4, name: 'Angles arrondis', image_url: 'assets/shape-rounded.png' },
    { id: 5, name: 'Ovale', image_url: 'assets/shape-oval.png' },
    { id: 6, name: 'Carré incliné', image_url: 'assets/shape-rhombus.png' },
    { id: 7, name: 'Octogonal (Stop)', image_url: 'assets/shape-octagon.png' },
    { id: 8, name: 'Direction à gauche', image_url: 'assets/shape-left-arrow.png' },
    { id: 9, name: 'Direction à droite', image_url: 'assets/shape-right-arrow.png' },
    { id: 10, name: 'Cercle', image_url: 'assets/shape-circle.png' },
    // Forme décorative pour la simulation de bordure
    { id: 11, name: 'Coins Décoratifs', image_url: 'assets/shape-decorative.png' }, 
];

const MOCK_DIMENSIONS: MaterialDimension[] = [
    // Acier Inox (ID 101)
    { id: 1001, material_id: 101, shape_id: 10, dimension_label: 'Ø 50mm x 1mm', unit_price_fcfa: 1500 }, 
    { id: 1002, material_id: 101, shape_id: 1, dimension_label: '120x60mm x 2mm', unit_price_fcfa: 4000 }, 
    { id: 1003, material_id: 101, shape_id: 4, dimension_label: '120x60mm x 2mm (Arrondi)', unit_price_fcfa: 4500 }, 
    
    // Aluminium (ID 102)
    { id: 2001, material_id: 102, shape_id: 10, dimension_label: 'Ø 100mm x 3mm', unit_price_fcfa: 3200 }, 
    { id: 2002, material_id: 102, shape_id: 2, dimension_label: '100x100mm x 1mm', unit_price_fcfa: 2500 }, 
    { id: 2003, material_id: 102, shape_id: 7, dimension_label: '150mm Octogonal x 3mm', unit_price_fcfa: 4200 }, 
    
    // Laiton (ID 201)
    { id: 3001, material_id: 201, shape_id: 2, dimension_label: '50x50mm x 0.5mm', unit_price_fcfa: 1800 }, 
    { id: 3002, material_id: 201, shape_id: 9, dimension_label: '200mm Flèche Droit', unit_price_fcfa: 3500 }, 
    // Dimension pour la forme décorative
    { id: 3003, material_id: 201, shape_id: 11, dimension_label: '150x80mm Décoratif x 1mm', unit_price_fcfa: 5500 },
];


// =================================================================
// 3. SOUS-COMPOSANTS (Tous les sélecteurs)
// =================================================================

// --- MaterialSelectorComponent ---
@Component({
    selector: 'app-material-selector',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="material-selector-panel">
            <div class="material-grid">
                @for (material of materials(); track material.id) {
                    <div 
                        (click)="selectMaterial(material)"
                        [class.selected]="material.id === selectedMaterial()?.id"
                        class="material-card"
                    >
                        <div class="material-preview-box" 
                             [style.background-color]="material.color">
                            <img *ngIf="material.image_url" [src]="material.image_url" [alt]="material.name" class="material-image"/>
                        </div>
                        <div class="material-info">
                            <h4 class="material-name"> {{ material.name }} </h4>
                            <p class="material-description">{{ material.description }}</p>
                        </div>
                        <div *ngIf="material.id === selectedMaterial()?.id" class="selection-indicator"> ✓ </div>
                    </div>
                }
            </div>
            @if (!materials().length) {
                <p class="message-info">Aucun matériau disponible.</p>
            }
        </div>
    `,
    styles: [`
        .material-selector-panel { padding: 10px 0; }
        .material-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; }
        .material-card { position: relative; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
        .material-card:hover { border-color: #a0a0ff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .material-card.selected { border-color: #4f46e5; box-shadow: 0 0 0 2px #4f46e5; }
        .material-preview-box { height: 70px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .material-image { height: 100%; width: 100%; object-fit: cover; opacity: 0.8; }
        .material-info { padding: 10px; }
        .material-name { font-size: 16px; font-weight: 600; color: #1f2937; }
        .material-card.selected .material-name { color: #4f46e5; }
        .material-description { font-size: 12px; color: #6b7280; line-height: 1.3; }
        .selection-indicator { position: absolute; top: 5px; right: 5px; background-color: #4f46e5; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-size: 14px; font-weight: bold; }
        .message-info { text-align: center; padding: 15px; background-color: #f0f0f0; border-radius: 6px; color: #6b7280; }
    `]
})
export class MaterialSelectorComponent {
    materials = input<Material[]>([]); 
    selectedMaterial = input<Material | null>(null); 
    materialSelected = output<Material | null>(); 

    selectMaterial(material: Material): void {
        const newSelection = this.selectedMaterial()?.id === material.id ? null : material;
        this.materialSelected.emit(newSelection);
    }
}

// --- ShapeSelectorComponent ---
@Component({
    selector: 'app-shape-selector',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="shape-selector-panel">
            @if (!material()) {
                <p class="message-info-warning">Veuillez d'abord sélectionner un **Matériau** (Étape 1).</p>
            } @else if (!shapes().length) {
                <p class="message-info-warning">Aucune forme disponible pour ce matériau.</p>
            } @else {
                <div class="shape-list">
                    @for (shape of shapes(); track shape.id) {
                        <div 
                            (click)="selectShape(shape)"
                            [class.selected]="shape.id === selectedShape()?.id"
                            class="shape-card"
                        >
                            <img [src]="shape.image_url" [alt]="shape.name" class="shape-image"/>
                            <h4 class="shape-name">{{ shape.name }}</h4>
                        </div>
                    }
                </div>
            }
        </div>
    `,
    styles: [`
        .shape-selector-panel { padding: 10px 0; text-align: center; }
        .message-info-warning { padding: 15px; background-color: #fff3cd; border: 1px solid #ffe0a3; border-radius: 6px; color: #856404; }
        .shape-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
        .shape-card { width: 120px; height: 120px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s; background-color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
        .shape-card:hover { border-color: #a0a0ff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .shape-card.selected { border-color: #4f46e5; box-shadow: 0 0 0 3px #4f46e5; }
        .shape-image { height: 60px; width: 60px; object-fit: contain; margin-bottom: 5px; }
        .shape-name { font-size: 14px; font-weight: 600; color: #1f2937; }
        .shape-card.selected .shape-name { color: #4f46e5; }
    `]
})
export class ShapeSelectorComponent { 
    material = input<Material | null>(null);
    shapes = input<Shape[]>([]); 
    selectedShape = input<Shape | null>(null); 
    shapeSelected = output<Shape | null>(); 

    selectShape(shape: Shape): void {
        const newSelection = this.selectedShape()?.id === shape.id ? null : shape;
        this.shapeSelected.emit(newSelection);
    }
}

// --- DimensionSelectorComponent (Mode Suggestion/Manuel) - CORRIGÉ ---
@Component({
    selector: 'app-dimension-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, DecimalPipe],
    template: `
        <div class="dimension-selector-panel">
            @if (material() && shape()) {
                
                <div class="selection-mode">
                    <label class="radio-label">
                        <input type="radio" name="mode" [value]="'suggested'" [(ngModel)]="selectionMode" (change)="onModeChange()">
                        Suggestions de taille
                    </label>
                    
                    <label class="radio-label">
                        <input type="radio" name="mode" [value]="'manual'" [(ngModel)]="selectionMode" (change)="onModeChange()">
                        Taille personnalisée
                    </label>
                </div>

                <div class="selection-content">
                    
                    @if (selectionMode === 'suggested' && dimensions().length > 0) {
                        <label for="dimension-select" class="select-label">Sélectionnez une dimension :</label>
                        <select 
                            id="dimension-select"
                            [ngModel]="selectedDimension()"
                            (ngModelChange)="onDimensionChange($event)"
                            class="dimension-select-box"
                        >
                            <option [ngValue]="null" disabled>-- Choisir une taille et une épaisseur --</option>
                            @for (dimension of dimensions(); track dimension.id) {
                                <option [ngValue]="dimension" class="select-option">
                                    {{ dimension.dimension_label }} ({{ dimension.unit_price_fcfa | number:'1.2-2' }} FCFA)
                                </option>
                            }
                        </select>
                        <p class="info-text">Prix basé sur la dimension et l'épaisseur prédéfinies.</p>
                    } 
                    
                    @if (selectionMode === 'manual') {
                        <div class="manual-input-group">
                            <div>
                                <label class="manual-label">Largeur (mm)</label>
                                <input type="number" [(ngModel)]="manualWidth" class="manual-input" placeholder="Largeur" (input)="calculateManualPrice()">
                            </div>
                            <span class="x-separator">x</span>
                            <div>
                                <label class="manual-label">Hauteur (mm)</label>
                                <input type="number" [(ngModel)]="manualHeight" class="manual-input" placeholder="Hauteur" (input)="calculateManualPrice()">
                            </div>
                            <div>
                                <label class="manual-label">Épaisseur (mm)</label>
                                <input type="number" [(ngModel)]="manualThickness" class="manual-input" placeholder="Épaisseur" (input)="calculateManualPrice()">
                            </div>
                        </div>

                        @if (manualPrice() !== null) {
                            <div class="manual-price-box">
                                Prix estimé (personnalisé) : 
                                <strong>{{ manualPrice()! | number:'1.2-2' }} FCFA</strong>
                            </div>
                        } @else if (manualWidth || manualHeight || manualThickness) {
                            <p class="error-text">Veuillez entrer Largeur, Hauteur et Épaisseur pour estimer le prix.</p>
                        } @else {
                            <p class="info-text">Entrez les dimensions souhaitées pour obtenir un prix estimé. Le prix final sera confirmé par un devis.</p>
                        }
                    }

                    @if (selectionMode === 'suggested' && dimensions().length === 0) {
                        <div class="message-info-warning">
                            <p class="font-medium">Aucune dimension prédéfinie disponible pour cette combinaison. Veuillez passer à **Taille personnalisée**.</p>
                        </div>
                    }

                </div>

            } @else {
                <div class="message-info-warning">
                    <p>Veuillez sélectionner un **Matériau** (Étape 1) et une **Forme** (Étape 2).</p>
                </div>
            }
        </div>
    `,
    styles: [`
        .dimension-selector-panel { padding: 10px 0; }
        
        .selection-mode { display: flex; gap: 20px; margin-bottom: 20px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
        .radio-label { display: flex; align-items: center; font-weight: 600; color: #1f2937; cursor: pointer; }
        .radio-label input { margin-right: 8px; accent-color: #4f46e5; }
        
        .select-label { display: block; margin-bottom: 10px; font-weight: 600; color: #1f2937; }
        .dimension-select-box { display: block; width: 100%; padding: 12px; border: 1px solid #e5e7eb; background-color: white; border-radius: 6px; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06); font-size: 16px; color: #1f2937; transition: border-color 0.2s; }
        .dimension-select-box:focus { border-color: #4f46e5; outline: none; }
        
        .manual-input-group { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;}
        .manual-input-group > div { flex: 1; min-width: 80px; }
        .manual-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        .manual-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 5px; }
        .x-separator { font-weight: bold; color: #4f46e5; padding-bottom: 10px; }
        
        .manual-price-box { padding: 15px; background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; text-align: center; }
        
        .message-info-warning { padding: 15px; background-color: #fff3cd; border: 1px solid #ffe0a3; border-radius: 6px; color: #856404; margin-top: 15px; }
        .info-text, .error-text { font-size: 14px; color: #6b7280; margin-top: 10px; }
        .error-text { color: #dc2626; font-weight: 600;}
    `]
})
export class DimensionSelectorComponent {
    material = input<Material | null>(null);
    shape = input<Shape | null>(null);
    dimensions = input<MaterialDimension[]>([]);

    selectedDimension = input<MaterialDimension | null>(null); 
    dimensionSelected = output<MaterialDimension | null>();

    selectionMode: 'suggested' | 'manual' = 'suggested';
    manualWidth: number | null = null;
    manualHeight: number | null = null;
    manualThickness: number | null = null;
    manualPrice = signal<number | null>(null);

    private BASE_PRICE_PER_MM2 = 0.05;

    onDimensionChange(dimension: MaterialDimension | null): void {
        this.dimensionSelected.emit(dimension);
    }
    
    onModeChange(): void {
        this.dimensionSelected.emit(null);
        this.manualPrice.set(null);
        if (this.selectionMode === 'manual') {
            this.calculateManualPrice();
        }
    }

    calculateManualPrice(): void {
        const material = this.material();
        const width = this.manualWidth;
        const height = this.manualHeight;
        const thickness = this.manualThickness;

        if (width && height && thickness && material) {
            const surface = width * height;
            const materialFactor = material.id === 101 ? 1.5 : material.id === 201 ? 1.2 : 1.0; 
            const estimatedPrice = surface * thickness * this.BASE_PRICE_PER_MM2 * materialFactor;
            
            this.manualPrice.set(estimatedPrice);

            const manualDim: MaterialDimension = {
                id: 0,
                material_id: material.id,
                shape_id: this.shape()!.id,
                dimension_label: `${width}x${height}mm x ${thickness}mm (Perso)`,
                unit_price_fcfa: estimatedPrice,
                material: material,
                shape: this.shape()!
            };
            this.dimensionSelected.emit(manualDim);

        } else if (this.selectionMode === 'manual') {
            this.manualPrice.set(null);
            this.dimensionSelected.emit(null);
        }
    }
}

// --- FixationSelectorComponent (NOUVEAU) ---
@Component({
    selector: 'app-fixation-selector',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="fixation-selector-panel">
            <h3>Choisir le type de Fixation</h3>
            <div class="fixation-grid">
                @for (fixation of fixationOptions; track fixation.id) {
                    <div 
                        (click)="selectFixation(fixation)"
                        [class.selected]="fixation.id === selectedFixation()?.id"
                        class="fixation-card"
                    >
                        <i class="fas {{ fixation.icon }} fixation-icon"></i>
                        <p class="fixation-name">{{ fixation.name }}</p>
                    </div>
                }
            </div>
            @if (selectedFixation()) {
                <p class="fixation-detail-info">Sélection: <strong>{{ selectedFixation()!.name }}</strong> (+{{ selectedFixation()!.price_modifier | number:'1.2-2' }} FCFA).</p>
            }
        </div>
    `,
    styles: [`
        .fixation-selector-panel { padding: 10px 0; }
        .fixation-selector-panel h3 { font-size: 18px; margin-bottom: 15px; }
        .fixation-grid { display: flex; flex-wrap: wrap; gap: 20px; }
        .fixation-card { width: 100px; height: 100px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s; background-color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
        .fixation-card:hover { border-color: #a0a0ff; }
        .fixation-card.selected { border-color: #4f46e5; box-shadow: 0 0 0 3px #4f46e5; }
        .fixation-icon { font-size: 30px; margin-bottom: 5px; color: #4f46e5; }
        .fixation-name { font-size: 14px; font-weight: 600; color: #1f2937; text-align: center; }
        .fixation-detail-info { margin-top: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 4px; }
    `]
})
export class FixationSelectorComponent {
    fixationOptions: FixationOption[] = [
        { id: 1, name: 'Vis/Boulons', icon: 'fa-bolt', price_modifier: 500 },
        { id: 2, name: 'Adhésif 3M', icon: 'fa-tape', price_modifier: 300 },
        { id: 3, name: 'Pied de table', icon: 'fa-shoe-prints', price_modifier: 800 },
        { id: 4, name: 'Sans fixation', icon: 'fa-minus-circle', price_modifier: 0 },
    ];
    
    selectedFixation = input<FixationOption | null>(null);
    fixationSelected = output<FixationOption | null>();

    selectFixation(fixation: FixationOption): void {
        const newSelection = this.selectedFixation()?.id === fixation.id ? null : fixation;
        this.fixationSelected.emit(newSelection);
    }
}

// --- BorderSelectorComponent (Étape 5) ---
@Component({
    selector: 'app-border-selector',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="border-selector-panel">
            <h3>Options de Bordure</h3>
            <div class="border-options-grid">
                
                <div 
                    (click)="selectBorder(null, 0)"
                    [class.selected]="!selectedBorderType"
                    class="option-card"
                >
                    <div class="preview-square no-border"></div>
                    <p>Aucune</p>
                </div>

                <div 
                    (click)="selectBorder('simple', 1)"
                    [class.selected]="selectedBorderType === 'simple'"
                    class="option-card"
                >
                    <div class="preview-square simple-border"></div>
                    <p>Bordure simple</p>
                </div>

                <div 
                    (click)="selectBorder('decorative', 11)"
                    [class.selected]="selectedBorderType === 'decorative'"
                    class="option-card"
                >
                    <div class="preview-square decorative-border"></div>
                    <p>Bordure décorative</p>
                </div>
            </div>
            
            @if (selectedBorderType) {
                <div class="color-picker-group">
                    <label>Couleur de la Bordure:</label>
                    <input type="color" [(ngModel)]="selectedColor" (ngModelChange)="updateColor()">
                    <span class="color-value">{{ selectedColor }}</span>
                </div>
            }
        </div>
    `,
    styles: [`
        .border-selector-panel { padding: 10px 0; }
        .border-selector-panel h3 { font-size: 18px; margin-bottom: 15px; }
        .border-options-grid { display: flex; gap: 20px; margin-bottom: 20px; }
        .option-card { width: 100px; height: 100px; border: 2px solid #ccc; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; }
        .option-card:hover { border-color: #4f46e5; }
        .option-card.selected { border-color: #4f46e5; box-shadow: 0 0 0 3px #c7d2fe; }
        
        .preview-square { width: 50px; height: 50px; border: 1px solid #000; margin-bottom: 5px; background: #fff; }
        .no-border { border: 1px dashed #ccc; }
        .simple-border { border: 4px solid black; }
        .decorative-border { 
            border: 5px solid black; 
            border-radius: 20px; /* Simulation de l'effet décoratif */
        }

        .color-picker-group { display: flex; align-items: center; gap: 10px; padding: 15px; border-top: 1px dashed #e5e7eb; }
        .color-picker-group label { font-weight: 600; }
        .color-value { font-family: monospace; }
    `]
})
export class BorderSelectorComponent {
    borderSelected = output<BorderOptions>(); 
    
    selectedBorderType: 'simple' | 'decorative' | null = null;
    selectedColor: string = '#000000';

    selectBorder(type: 'simple' | 'decorative' | null, shapeId: number | null): void {
        this.selectedBorderType = type;
        this.emitSelection(shapeId);
    }
    
    updateColor(): void {
        const shapeId = this.selectedBorderType === 'decorative' ? 11 : 1;
        this.emitSelection(shapeId);
    }
    
    private emitSelection(shapeId: number | null): void {
        this.borderSelected.emit({ 
            type: this.selectedBorderType, 
            shapeId: this.selectedBorderType ? shapeId : null, 
            color: this.selectedColor 
        } as BorderOptions);
    }
}

// --- TextEditorComponent (NOUVEAU) ---
@Component({
    selector: 'app-text-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="text-editor-panel">
            <h3>Saisie de Texte</h3>
            <p>Ajoutez le texte de votre plaque. Le rendu sera affiché dans l'aperçu.</p>
            
            <div class="text-controls-group">
                <button (click)="addText()" class="add-text-btn">
                    <i class="fas fa-plus-circle"></i> Ajouter un nouveau texte
                </button>
            </div>

            @if (texts().length === 0) {
                <div class="placeholder-text">
                    Cliquez sur "Ajouter un nouveau texte" pour commencer la personnalisation.
                </div>
            }

            @for (text of texts(); track $index) {
                <div class="text-item-card">
                    <textarea 
                        [(ngModel)]="text.content" 
                        (ngModelChange)="updateText()"
                        placeholder="Entrez votre texte ici (ligne {{ $index + 1 }})"
                    ></textarea>
                    <div class="text-options">
                        <select [(ngModel)]="text.font" (ngModelChange)="updateText()">
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                        <select [(ngModel)]="text.size" (ngModelChange)="updateText()">
                            <option value="small">Petit</option>
                            <option value="medium">Moyen</option>
                            <option value="large">Grand</option>
                        </select>
                        <button (click)="removeText($index)" class="remove-text-btn">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            }
            
        </div>
    `,
    styles: [`
        .text-editor-panel { padding: 10px 0; }
        .text-editor-panel h3 { font-size: 18px; margin-bottom: 15px; }
        
        .add-text-btn { padding: 10px 15px; background-color: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-bottom: 15px; transition: background-color 0.2s; }
        .add-text-btn:hover { background-color: #3b82f6; }
        .add-text-btn i { margin-right: 5px; }
        
        .placeholder-text { padding: 20px; text-align: center; color: #6b7280; border: 1px dashed #ccc; border-radius: 6px; }
        
        .text-item-card { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 15px; padding: 10px; background-color: #f9fafb; }
        .text-item-card textarea { width: 100%; min-height: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical; margin-bottom: 10px; font-size: 15px; }
        
        .text-options { display: flex; gap: 10px; align-items: center; }
        .text-options select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .remove-text-btn { background: #ef4444; color: white; border: none; padding: 8px 10px; border-radius: 4px; cursor: pointer; margin-left: auto; }
        .remove-text-btn:hover { background: #dc2626; }
    `]
})
export class TextEditorComponent {
    textData: TextContent[] = [];
    texts = signal(this.textData);
    
    textUpdated = output<TextContent[]>();

    addText(): void {
        this.textData.push({ content: '', font: 'Arial', size: 'medium' });
        this.texts.set([...this.textData]);
        this.textUpdated.emit(this.texts());
    }
    
    removeText(index: number): void {
        this.textData.splice(index, 1);
        this.texts.set([...this.textData]);
        this.textUpdated.emit(this.texts());
    }

    updateText(): void {
        this.texts.set([...this.textData]);
        this.textUpdated.emit(this.texts());
    }
}


// --- PreviewComponent (Affichage dynamique et texte) ---
@Component({
    selector: 'app-preview',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="preview-container">
            <h3 class="preview-title">Aperçu du Produit</h3>
            @if (selectedDimension()) {
                <div 
                    class="preview-box"
                    [class.border-simple]="borderOptions()?.type === 'simple'"
                    [class.border-decorative]="borderOptions()?.type === 'decorative'"
                    [style.border-color]="borderOptions()?.color"
                    [style.border-width]="borderOptions()?.type ? '4px' : '0'"
                >
                    <img *ngIf="selectedDimension()?.material?.image_url" [src]="selectedDimension()?.material?.image_url" alt="Texture du matériau" class="material-texture-image"/>
                    <img *ngIf="selectedDimension()?.shape?.image_url" [src]="selectedDimension()?.shape?.image_url" alt="Forme sélectionnée" class="shape-overlay-image"/>
                    
                    <div class="text-overlay">
                        @for (text of textContent(); track $index) {
                            <p 
                                [style.font-family]="text.font" 
                                [class.size-small]="text.size === 'small'"
                                [class.size-medium]="text.size === 'medium'"
                                [class.size-large]="text.size === 'large'"
                            >
                                {{ text.content }}
                            </p>
                        }
                    </div>
                </div>
                <div class="summary-info">
                    <p>Matériau: <strong>{{ selectedDimension()?.material?.name }}</strong></p>
                    <p>Forme: <strong>{{ selectedDimension()?.shape?.name }}</strong></p>
                    <p>Dimension: <strong>{{ selectedDimension()?.dimension_label }}</strong></p>
                </div>
            } @else {
                <div class="preview-placeholder">
                    <p>Sélectionnez un **Matériau**, une **Forme** et une **Dimension**.</p>
                </div>
            }
        </div>
    `,
    styles: [`
        .preview-container { padding: 20px; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); }
        .preview-title { font-size: 20px; font-weight: 700; color: #4f46e5; margin-bottom: 15px; }
        .preview-box { 
            position: relative; 
            width: 100%; 
            height: 250px; 
            background-color: #f9fafb; 
            border-radius: 6px; 
            overflow: hidden; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border: 2px dashed #4f46e5; 
            transition: all 0.3s ease-in-out; 
        }
        .preview-box.border-simple { border-style: solid !important; border-radius: 6px; }
        .preview-box.border-decorative { border-style: solid !important; border-width: 8px !important; border-radius: 20px; padding: 10px; }
        
        .material-texture-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
        .shape-overlay-image { position: relative; width: 40%; height: 40%; object-fit: contain; z-index: 10; padding: 10px; background-color: rgba(255, 255, 255, 0.8); border-radius: 12px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); }
        
        .text-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 20; 
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center; 
            padding: 10px;
            text-align: center;
        }

        .text-overlay p {
            margin: 2px 0;
            font-weight: bold;
            color: #333;
            line-height: 1.2;
            white-space: pre-wrap;
        }

        .text-overlay .size-small { font-size: 12px; }
        .text-overlay .size-medium { font-size: 16px; }
        .text-overlay .size-large { font-size: 24px; }

        .summary-info { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; }
        .summary-info p { margin: 5px 0; font-size: 15px; color: #1f2937; }
        .preview-placeholder { height: 250px; display: flex; align-items: center; justify-content: center; text-align: center; color: #6b7280; font-style: italic; background-color: #f5f5f5; border-radius: 6px; }
    `]
})
export class PreviewComponent {
    selectedDimension = input<MaterialDimension | null>(null);
    borderOptions = input<BorderOptions | null>(null);
    textContent = input<TextContent[]>([]); 
}

// --- PriceDisplayComponent ---
@Component({
    selector: 'app-price-display',
    standalone: true,
    imports: [CommonModule, DecimalPipe], 
    template: `
        <div class="price-display-container">
            <h3 class="price-title">Récapitulatif et Prix</h3>
            @if (selectedDimension()) {
                <div class="price-box">
                    <p class="price-label">Prix Unitaire Estimé HT</p>
                    <p class="price-value">
                        {{ selectedDimension()!.unit_price_fcfa | number:'1.2-2' }} FCFA
                    </p>
                </div>
                <div class="details-list">
                    <p><span class="detail-label">Matériau:</span> {{ selectedDimension()?.material?.name }}</p>
                    <p><span class="detail-label">Forme:</span> {{ selectedDimension()?.shape?.name }}</p>
                    <p><span class="detail-label">Dimension:</span> {{ selectedDimension()?.dimension_label }}</p>
                    </div>
            } @else {
                <div class="price-placeholder">
                    <p>Prix calculé après sélection des dimensions.</p>
                </div>
            }
        </div>
    `,
    styles: [`
        .price-display-container { padding: 20px; background-color: white; border: 2px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); }
        .price-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .price-box { text-align: center; padding: 15px; background-color: #e6e0ff; border: 1px solid #4f46e5; border-radius: 6px; margin-bottom: 20px; }
        .price-label { font-size: 16px; color: #4f46e5; }
        .price-value { font-size: 30px; font-weight: 800; color: #4f46e5; margin-top: 5px; }
        .details-list { padding-top: 10px; border-top: 1px dashed #e5e7eb; }
        .detail-label { font-weight: 600; color: #1f2937; margin-right: 5px; }
        .price-placeholder { padding: 20px; text-align: center; color: #6b7280; font-style: italic; background-color: #f5f5f5; border-radius: 6px; }
    `]
})
export class PriceDisplayComponent {
    selectedDimension = input<MaterialDimension | null>(null);
}


// =================================================================
// 4. COMPOSANT PRINCIPAL (CONFIGURATOR)
// =================================================================

@Component({
    selector: 'app-configurator',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule,
        MaterialSelectorComponent, 
        ShapeSelectorComponent, 
        DimensionSelectorComponent, 
        FixationSelectorComponent, 
        BorderSelectorComponent, 
        TextEditorComponent, 
        PreviewComponent, 
        PriceDisplayComponent
    ],
    templateUrl: './configurator.component.html',
    styleUrl: './configurator.component.css', 
})
export class ConfiguratorComponent implements OnInit {

    private route = inject(ActivatedRoute);

    // --- ÉTATS GLOBAUX ---
    currentStep = signal(1); 
    
    allMaterials = signal<Material[]>(MOCK_MATERIALS);
    allShapes = signal<Shape[]>(MOCK_SHAPES);
    allDimensions = signal<MaterialDimension[]>(MOCK_DIMENSIONS);

    // --- ÉTATS DE SÉLECTION ---
    selectedMaterial = signal<Material | null>(null);
    selectedShape = signal<Shape | null>(null);
    selectedDimension = signal<MaterialDimension | null>(null);
    selectedFixation = signal<FixationOption | null>(null); 
    selectedBorder = signal<BorderOptions | null>(null); 
    currentTextContent = signal<TextContent[]>([]); 

    // --- ÉTATS D'ERREUR/MESSAGE ---
    errorMessage = signal<string | null>(null);

    // --- LOGIQUE DE DÉPENDANCE (COMPUTED) ---
    availableShapes: Signal<Shape[]> = computed(() => {
        return this.allShapes();
    });

    availableDimensions: Signal<MaterialDimension[]> = computed(() => {
        const mat = this.selectedMaterial();
        const shape = this.selectedShape();
        
        if (!mat || !shape) {
            return [];
        }

        const filtered = this.allDimensions().filter(
            (dim) => dim.material_id === mat.id && dim.shape_id === shape.id
        );

        return filtered.map(dim => ({
            ...dim,
            material: mat,
            shape: shape,
        }));
    });

    finalProduct: Signal<MaterialDimension | null> = computed(() => {
        const dim = this.selectedDimension();
        const fixation = this.selectedFixation();
        
        if (!dim) return null;
        
        const fixationPrice = fixation ? fixation.price_modifier : 0;
        
        return {
            ...dim,
            // Recalculer le prix pour inclure la fixation
            unit_price_fcfa: dim.unit_price_fcfa + fixationPrice 
        };
    });

    // --- GESTION DES ÉVÉNEMENTS (HANDLERS) ---
    
    prevStep(): void {
        this.currentStep.update(current => Math.max(1, current - 1));
        this.errorMessage.set(null);
    }
    
    onMaterialSelected(material: Material | null): void {
        this.selectedMaterial.set(material);
        this.selectedShape.set(null);
        this.selectedDimension.set(null);
        this.selectedFixation.set(null);
        this.selectedBorder.set(null);
        this.currentTextContent.set([]);
        this.errorMessage.set(null);
        if (material) {
             this.currentStep.set(2); 
        }
    }

    onShapeSelected(shape: Shape | null): void {
        this.selectedShape.set(shape);
        this.selectedDimension.set(null);
        this.selectedFixation.set(null);
        this.selectedBorder.set(null);
        this.currentTextContent.set([]);
        this.errorMessage.set(null);
        if (shape) {
            this.currentStep.set(3); 
        }
    }

    onDimensionSelected(dimension: MaterialDimension | null): void {
        this.selectedDimension.set(dimension);
        this.selectedFixation.set(null);
        this.selectedBorder.set(null);
        this.currentTextContent.set([]);
        this.errorMessage.set(null);
        if (dimension) {
            this.currentStep.set(4); // Avance à Fixation
        }
    }

    onFixationSelected(fixation: FixationOption | null): void {
        this.selectedFixation.set(fixation);
        this.selectedBorder.set(null);
        this.currentTextContent.set([]);
        this.errorMessage.set(null);
        if (fixation) {
            this.currentStep.set(5); // Avance à Bordure/Couleur
        }
    }

    onBorderSelected(options: BorderOptions): void {
        this.selectedBorder.set(options);
        this.currentTextContent.set([]);
        this.errorMessage.set(null);
        this.currentStep.set(6); // Avance à Texte
    }

    onTextContentUpdated(content: TextContent[]): void {
        this.currentTextContent.set(content);
        this.errorMessage.set(null);
        this.currentStep.set(7); // Avance à Prix & Devis
    }

    finalizeConfiguration(): void {
        const product = this.finalProduct();
        const border = this.selectedBorder();
        const fixation = this.selectedFixation();
        
        if (product) {
            const borderInfo = border?.type ? ` avec bordure ${border.type}` : '';
            const fixationInfo = fixation?.name ? ` + Fixation: ${fixation.name}` : '';

            this.errorMessage.set(`✅ Configuration terminée : ${product.material?.name} ${product.shape?.name}${borderInfo}${fixationInfo}. Prix total estimé : ${product.unit_price_fcfa.toFixed(2)} FCFA. Ajoutée au Devis/Panier !`);
        } else {
            this.errorMessage.set('⚠️ Veuillez compléter les étapes de configuration (Matériau, Forme, Dimension).');
        }
    }

    // --- INITIALISATION AVEC PARAMÈTRE DE ROUTE ---
    
    ngOnInit(): void {
        const materialIdParam = this.route.snapshot.paramMap.get('materialId');

        if (materialIdParam) {
            const materialId = parseInt(materialIdParam, 10);
            const initialMaterial = this.allMaterials().find(m => m.id === materialId);

            if (initialMaterial) {
                this.selectedMaterial.set(initialMaterial);
                this.currentStep.set(2);
                this.errorMessage.set(`Matériau "${initialMaterial.name}" pré-sélectionné depuis le catalogue.`);
            } else {
                this.errorMessage.set('Erreur : Matériau pré-sélectionné introuvable. Veuillez choisir un matériau.');
                this.currentStep.set(1);
            }
        } else {
            this.currentStep.set(1);
        }
    }
}