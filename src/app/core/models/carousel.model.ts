export interface Carousel {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  full_image_url: string;
  link: string;           // <--- Changez 'link_url' en 'link' (nom réel en BDD)
  order: number;
  height: number;
  category_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}