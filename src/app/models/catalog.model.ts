// Basé sur le CatalogController.php : getCategories()
export interface Category {
  id: number;
  name: string;
  description: string;
}

// Basé sur le CatalogController.php : getMaterials()
export interface Material {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  category_id: number;
  // Ajout du modèle Category pour la cohérence
  category?: Category; 
}

// Basé sur le CatalogController.php : getShapes()
export interface Shape {
  id: number;
  name: string;
  description: string;
  // Impact sur le prix de base (ex: 1.0 pour standard, 1.2 pour complexe)
  base_price_impact: number; 
}

// Interface pour les données envoyées au POST /api/catalog/quotes/estimate
export interface EstimationRequest {
  material_id: number;
  shape_id: number;
  width: number; // en mm
  height: number; // en mm
  quantity: number;
  thickness: number; // Épaisseur du matériau
  file?: File | null; 
}

// Interface pour la réponse reçue de POST /api/catalog/quotes/estimate
export interface EstimationResult {
  estimated_price: number;
  material_cost: number;
  processing_cost: number; 
  file_cost: number; 
  unit_price: number; 
  quantity_discount_rate: number; 
  details: any; 
}
