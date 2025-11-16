export interface Shape {
  id: number;
  name: string;
  image_url: string | null; // NÉCESSAIRE pour PreviewComponent
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description?: string;
}