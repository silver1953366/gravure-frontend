export interface Attachment {
    id: number;
    // Définit le modèle lié (ex: 'App\\Models\\Quote')
    attachable_type: string;
    // ID du modèle lié (ex: quote_id)
    attachable_id: number; 
    stored_path: string;
    // Nom original du fichier pour l'affichage
    original_name: string; 
    size: number; 
    mime_type: string;
    created_at: Date | string; // Utiliser string si le backend renvoie une chaîne ISO
    updated_at: Date | string;
}

// Interface pour la réponse attendue après un téléversement réussi
// Souvent, le backend renvoie l'objet Attachment nouvellement créé.
export interface UploadResponse {
    message: string;
    attachment: Attachment;
}