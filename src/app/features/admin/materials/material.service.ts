import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Modèle de Matériau
export interface Material {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    price_per_sq_meter: number;
    thickness_options: string;
    is_active: boolean;
    // PROPRIÉTÉ CONFIRMÉE
    category_id: number; 
}

// Données mockées pour simuler l'API
let MOCK_MATERIALS: Material[] = [
    { id: 1, name: 'Aluminium 5052', slug: 'aluminium-5052', description: 'Résistant à la corrosion marine.', image_url: 'https://placehold.co/150x150/059669/white?text=AL5052', price_per_sq_meter: 45.50, thickness_options: '1mm, 2mm, 3mm', is_active: true, category_id: 1 },
    { id: 2, name: 'Acier Inoxydable 304', slug: 'acier-inox-304', description: 'Le standard de l\'inox.', image_url: 'https://placehold.co/150x150/3b82f6/white?text=IN304', price_per_sq_meter: 68.90, thickness_options: '0.5mm, 1.5mm', is_active: true, category_id: 2 },
    { id: 3, name: 'Contreplaqué Bouleau', slug: 'contreplaque-bouleau', description: 'Léger et polyvalent.', image_url: 'https://placehold.co/150x150/f59e0b/white?text=WOOD', price_per_sq_meter: 25.00, thickness_options: '10mm, 15mm', is_active: false, category_id: 3 },
];

@Injectable({
    providedIn: 'root'
})
export class MaterialService {
    
    private apiUrl = '/api/materials'; 

    constructor() { }

    getMaterials(): Observable<Material[]> {
        return of(MOCK_MATERIALS).pipe(delay(500));
    }

    getMaterial(id: number): Observable<Material> {
        const material = MOCK_MATERIALS.find(m => m.id === id);
        if (!material) {
            return new Observable(observer => observer.error({ status: 404 }));
        }
        return of(material).pipe(delay(300));
    }

    createMaterial(formData: FormData): Observable<Material> {
        return of(null).pipe(
            delay(500),
            map(() => {
                const newId = Math.max(...MOCK_MATERIALS.map(m => m.id)) + 1;
                const newMaterial: Material = {
                    id: newId,
                    name: formData.get('name') as string,
                    slug: formData.get('slug') as string,
                    description: formData.get('description') as string,
                    image_url: 'https://placehold.co/150x150/06b6d4/white?text=NEW', 
                    price_per_sq_meter: parseFloat(formData.get('price_per_sq_meter') as string),
                    thickness_options: formData.get('thickness_options') as string,
                    is_active: formData.get('is_active') === '1',
                    category_id: parseInt(formData.get('category_id') as string, 10), 
                };
                MOCK_MATERIALS.push(newMaterial);
                return newMaterial;
            })
        );
    }

    updateMaterial(id: number, formData: FormData): Observable<Material> {
        return of(null).pipe(
            delay(500),
            map(() => {
                const index = MOCK_MATERIALS.findIndex(m => m.id === id);
                if (index === -1) {
                    throw new Error("Matériau non trouvé");
                }
                
                const existingMaterial = MOCK_MATERIALS[index];
                
                MOCK_MATERIALS[index] = {
                    ...existingMaterial,
                    name: formData.get('name') as string,
                    slug: formData.get('slug') as string,
                    description: formData.get('description') as string,
                    price_per_sq_meter: parseFloat(formData.get('price_per_sq_meter') as string),
                    thickness_options: formData.get('thickness_options') as string,
                    is_active: formData.get('is_active') === '1',
                    category_id: parseInt(formData.get('category_id') as string, 10), 
                    image_url: formData.has('image') 
                        ? 'https://placehold.co/150x150/ef4444/white?text=UPDATED' 
                        : existingMaterial.image_url,
                };
                return MOCK_MATERIALS[index];
            })
        );
    }

    deleteMaterial(id: number): Observable<void> {
        MOCK_MATERIALS = MOCK_MATERIALS.filter(m => m.id !== id);
        return of(undefined).pipe(delay(200));
    }
}