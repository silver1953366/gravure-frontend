// src/app/core/models/auth.models.ts

// Basé sur les champs de votre modèle User Laravel
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'controller' | 'client';
    created_at: string;
    updated_at?: string;
}

// Payload pour la connexion
export interface LoginPayload {
    email: string;
    password: string;
}

// Payload pour l'inscription
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
    message?: string; // Présent pour la réponse de 'register'
    
    // NOUVEAU: Le token de session est renvoyé par le backend pour la fusion du panier anonyme
    session_token?: string; 
}