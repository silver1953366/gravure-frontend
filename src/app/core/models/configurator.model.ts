/*import { Type } from '@angular/core';
import { LucideIcon } from 'lucide-angular'; // Supposons l'utilisation d'une librairie d'icônes Angular/Lucide

// Interface pour les options
export interface Material {
  id: string;
  name: string;
  finish: string;
  thickness: string;
  uvResistance: boolean;
  description: string;
  sample: string; // Couleur Hex
  priceModifier: number;
}

export interface Size {
  id: string;
  label: string;
  width: number;
  height: number;
  priceModifier: number;
}

export interface Border {
  id: string;
  label: string;
  description: string;
  style: 'none' | 'classic' | 'double';
  priceModifier: number;
}

export interface ColorOption {
  id: string;
  label: string;
  value: string; // Couleur Hex
}

export interface Step {
  id: string;
  label: string;
  icon: Type<any>; // Type d'icône (ajuster selon votre librairie d'icônes)
}

// ------------------- DONNÉES -------------------

export const BASE_PRICE = 27.09;

export const MATERIALS: Material[] = [
  {
    id: 'pvc-color',
    name: 'Plastique impression couleur',
    finish: 'Impression couleur haute résolution',
    thickness: '2 mm',
    uvResistance: true,
    description: 'Plaque PVC expansé légère et polyvalente, parfaite pour l\'intérieur et l\'extérieur.',
    sample: '#ffffff',
    priceModifier: 0,
  },
  {
    id: 'pvc-grave',
    name: 'Plastique gravé',
    finish: 'Gravure bicolore',
    thickness: '1,6 mm',
    uvResistance: true,
    description: 'Aspect professionnel avec finition légèrement mate et gravure durable.',
    sample: '#f4f4f5',
    priceModifier: 3.5,
  },
  {
    id: 'plexi',
    name: 'Plexiglas',
    finish: 'Surface brillante',
    thickness: '3 mm',
    uvResistance: true,
    description: 'Panneau en acrylique premium, idéal pour une signalétique haut de gamme.',
    sample: '#f8fafc',
    priceModifier: 6.2,
  },
];

export const SIZES: Size[] = [
  { id: '120x50', label: '120 x 50 mm', width: 120, height: 50, priceModifier: 0 },
  { id: '180x70', label: '180 x 70 mm', width: 180, height: 70, priceModifier: 4.5 },
  { id: '250x90', label: '250 x 90 mm', width: 250, height: 90, priceModifier: 7.9 },
  { id: '295x120', label: '295 x 120 mm', width: 295, height: 120, priceModifier: 11.4 },
];

export const BORDERS: Border[] = [
  {
    id: 'none',
    label: 'Sans bordure',
    description: 'Style minimaliste sans encadrement.',
    style: 'none',
    priceModifier: 0,
  },
  {
    id: 'classic',
    label: 'Bordure classique',
    description: 'Encadrement noir contrasté.',
    style: 'classic',
    priceModifier: 2.2,
  },
  {
    id: 'double',
    label: 'Double filet',
    description: 'Double contour raffiné.',
    style: 'double',
    priceModifier: 3.8,
  },
];

export const COLORS: ColorOption[] = [
  { id: 'black', label: 'Noir', value: '#111827' },
  { id: 'midnight', label: 'Bleu nuit', value: '#1e3a8a' },
  { id: 'forest', label: 'Vert forêt', value: '#14532d' },
  { id: 'burgundy', label: 'Bordeaux', value: '#7c2d12' },
];

// Les étapes utilisent les icônes Lucide. Dans un vrai projet Angular, vous utiliseriez
// soit une librairie Angular pour Lucide (ex: lucide-angular), soit vos propres composants d'icônes.
// Pour l'exemple, nous allons simuler les icônes pour les imports.
// Remplacez 'FakeIcon' par les vrais composants d'icônes si besoin.
import { PanelsTopLeft, Palette, Ruler, Shapes, Drill, SquarePen, LayoutTemplate, Type, Image as ImageIcon } from 'lucide-angular'; 

export const STEPS: Step[] = [
  { id: 'product', label: 'Produit', icon: PanelsTopLeft as Type<any> },
  { id: 'material', label: 'Matière', icon: Palette as Type<any> },
  { id: 'size', label: 'Taille', icon: Ruler as Type<any> },
  { id: 'shape', label: 'Forme', icon: Shapes as Type<any> },
  { id: 'fixation', label: 'Fixation', icon: Drill as Type<any> },
  { id: 'color', label: 'Couleur', icon: SquarePen as Type<any> },
  { id: 'border', label: 'Bordure', icon: LayoutTemplate as Type<any> },
  { id: 'text', label: 'Texte', icon: Type as Type<any> },
  { id: 'image', label: 'Image', icon: ImageIcon as Type<any> },
];*/