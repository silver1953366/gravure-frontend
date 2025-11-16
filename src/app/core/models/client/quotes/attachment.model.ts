// src/app/core/models/client/quotes/attachment.model.ts

export interface Attachment {
    id: number;
    attachable_type: string;
    attachable_id: number;
    file_path: string;
    // Utilisation de snake_case basée sur le backend Laravel
    original_name: string; 
    size: number; 
    mime_type: string;
    created_at: Date;
    updated_at: Date;
}