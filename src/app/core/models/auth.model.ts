// Basé sur les champs de votre modèle User Laravel
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'controller' | 'client';
    created_at: string;
    // Ajoutez d'autres champs si nécessaire
}

// Payload pour la connexion
export interface LoginPayload {
    email: string;
    password: string;
}

// Payload pour l'inscription (votre AuthController ne demande pas de rôle)
export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation?: string; // Utilisé côté Front pour validation uniquement
}

// Réponse attendue de votre API Laravel pour /login et /register
export interface AuthResponse {
    user: User;
    access_token: string;
    message?: string; // Présent uniquement pour la réponse de 'register'
}