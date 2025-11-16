import { Category } from './category.model'; // 👈 AJOUTEZ CETTE LIGNE

export interface Material {
  id: number;
  name: string;
  category_id: number;
  color?: string; 
  image_url?: string;
  description?: string;
  
  // Cette ligne est maintenant valide grâce à l'importation ci-dessus
  category?: Category; 
}

// Données MOCK mises à jour :
export const MOCK_MATERIALS: Material[] = [
  { 
    id: 101, 
    name: 'Acier Inox 304', 
    category_id: 1, 
    color: '#A0A0A0', 
    // Image d'acier brossé
    image_url: 'https://images.unsplash.com/photo-1518609590740-192a2a096c4d?q=80&w=150&h=150&auto=format&fit=crop', 
    description: 'Résistance supérieure à la corrosion et haute durabilité. Idéal pour l\'agroalimentaire.' 
  },
  { 
    id: 102, 
    name: 'Aluminium 6061', 
    category_id: 2, 
    color: '#C0C0C0', 
    // Image de plaque d'aluminium
    image_url: 'https://images.unsplash.com/photo-1620248881476-0f8c8531061f?q=80&w=150&h=150&auto=format&fit=crop', 
    description: 'Léger, excellente conductivité thermique et facile à usiner. Pour les structures légères.' 
  },
  { 
    id: 201, 
    name: 'Laiton Poli', 
    category_id: 3, 
    color: '#D4AF37', 
    // Image de surface en laiton/cuivre
    image_url: 'https://images.unsplash.com/photo-1624896740645-0d3d532b2f69?q=80&w=150&h=150&auto=format&fit=crop', 
    description: 'Aspect esthétique, souvent utilisé en décoration et en connectique électrique.' 
  },
  { 
    id: 202, 
    name: 'Teflon PTFE', 
    category_id: 4, 
    color: '#F0F0F0', 
    // Image de plastique blanc
    image_url: 'https://images.unsplash.com/photo-1605739328225-b44c8c76088e?q=80&w=150&h=150&auto=format&fit=crop', 
    description: 'Faible coefficient de friction, résistant aux produits chimiques et hautes températures.' 
  },
  { 
    id: 103, 
    name: 'Bronze Phosphoreux', 
    category_id: 3, 
    color: '#D2691E', 
    // Image de métal teinté
    image_url: 'https://images.unsplash.com/photo-1549419134-2983791a8301?q=80&w=150&h=150&auto=format&fit=crop', 
    description: 'Excellentes propriétés mécaniques et très bonne résistance à la fatigue et à la corrosion marine.' 
  },
  // Ajoutez d'autres matériaux si nécessaire...



  { 
    id: 101, 
    name: 'Acier Inox 304', 
    category_id: 1, 
    color: '#A0A0A0', 
    image_url: 'https://images.unsplash.com/photo-1518609590740-192a2a096c4d?q=80&w=350&h=200&auto=format&fit=crop&crop=left', 
    description: 'Résistance supérieure à la corrosion et haute durabilité. Idéal pour l\'agroalimentaire.' 
  },
  { 
    id: 102, 
    name: 'Acier Carbone S235', 
    category_id: 1, 
    color: '#333333', 
    image_url: 'https://images.unsplash.com/photo-1563851080072-20ed6778f685?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Acier de construction standard. Très bonne soudabilité, utilisé pour les charpentes et supports.' 
  },
  { 
    id: 103, 
    name: 'Acier Traité C45', 
    category_id: 1, 
    color: '#444444', 
    image_url: 'https://images.unsplash.com/photo-1579782539162-d4619a9f2390?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Acier au carbone utilisé pour la fabrication d\'arbres, d\'engrenages et de pièces soumises à l\'usure.' 
  },
  
  // --- Aluminiums (Catégorie 2) ---
  { 
    id: 201, 
    name: 'Aluminium 6061', 
    category_id: 2, 
    color: '#C0C0C0', 
    image_url: 'https://images.unsplash.com/photo-1620248881476-0f8c8531061f?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Léger, excellente conductivité thermique et facile à usiner. Pour les structures légères et aéronautiques.' 
  },
  { 
    id: 202, 
    name: 'Aluminium 7075 T6', 
    category_id: 2, 
    color: '#B0B0B0', 
    image_url: 'https://images.unsplash.com/photo-1620248881476-0f8c8531061f?q=80&w=350&h=200&auto=format&fit=crop&crop=bottom', 
    description: 'Très haute résistance. Souvent utilisé dans les applications nécessitant un faible poids et une grande robustesse.' 
  },
  
  // --- Cuivres & Laitons (Catégorie 3) ---
  { 
    id: 301, 
    name: 'Laiton Poli', 
    category_id: 3, 
    color: '#D4AF37', 
    image_url: 'https://images.unsplash.com/photo-1624896740645-0d3d532b2f69?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Aspect esthétique, grande usinabilité, souvent utilisé en décoration et en connectique électrique.' 
  },
  { 
    id: 302, 
    name: 'Cuivre Électrolytique', 
    category_id: 3, 
    color: '#B87333', 
    image_url: 'https://images.unsplash.com/photo-1534000305779-3765e1564f8c?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Meilleur conducteur électrique. Indispensable pour les barres bus et les équipements électriques haute performance.' 
  },
  
  // --- Polymères Techniques (Catégorie 4) ---
  { 
    id: 401, 
    name: 'Teflon PTFE', 
    category_id: 4, 
    color: '#F0F0F0', 
    image_url: 'https://images.unsplash.com/photo-1605739328225-b44c8c76088e?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Faible coefficient de friction, résistant aux produits chimiques et hautes températures. Idéal pour les joints.' 
  },
  { 
    id: 402, 
    name: 'PEEK (Polyétheréthercétone)', 
    category_id: 4, 
    color: '#A9A9A9', 
    image_url: 'https://images.unsplash.com/photo-1596765798031-64506306000c?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Excellentes propriétés mécaniques, thermiques et chimiques. Utilisé dans des environnements extrêmes.' 
  },
  { 
    id: 403, 
    name: 'Nylon PA6 chargé verre', 
    category_id: 4, 
    color: '#4682B4', 
    image_url: 'https://images.unsplash.com/photo-1596765798031-64506306000c?q=80&w=350&h=200&auto=format&fit=crop&crop=right', 
    description: 'Haute rigidité et résistance à l\'usure. Renforcé par des fibres de verre pour une meilleure stabilité dimensionnelle.' 
  },

  // --- Composites (Catégorie 5) ---
  { 
    id: 501, 
    name: 'Fibre de Carbone (CFRP)', 
    category_id: 5, 
    color: '#000000', 
    image_url: 'https://images.unsplash.com/photo-1609142851173-b3c99026210f?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Léger et extrêmement résistant. Utilisé dans l\'aéronautique, l\'automobile de sport et les équipements de haute technologie.' 
  },
  { 
    id: 502, 
    name: 'Composite G10 (Fibre de verre)', 
    category_id: 5, 
    color: '#F0FFFF', 
    image_url: 'https://images.unsplash.com/photo-1547432095-88546b3f7f18?q=80&w=350&h=200&auto=format&fit=crop', 
    description: 'Matériau stratifié à base de fibre de verre et de résine époxy. Très bonne résistance mécanique et isolation électrique.' 
  },
];
