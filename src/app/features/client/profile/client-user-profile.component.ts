import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientUserProfileService, ClientUser, UpdateProfileResponse } from './client-user-profile.service';

@Component({
  selector: 'app-client-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-user-profile.component.html',
  styleUrls: ['./client-user-profile.component.css']
})
export class ClientUserProfileComponent implements OnInit {

  // Données de l'utilisateur
  user: ClientUser | null = null;
  // Modèle lié au formulaire (clone pour éviter les modifications en direct)
  updatedUser: Partial<ClientUser> = {};

  // États de l'interface
  isLoading = true;
  isEditing = false;
  isSaving = false; // Nouvel état pour désactiver le bouton pendant l'envoi

  // Messages de retour
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private profileService: ClientUserProfileService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Charge les données initiales du profil depuis l'API
   */
  loadProfile(): void {
    this.isLoading = true;
    this.error = null;

    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.updatedUser = { ...data }; // Initialise le formulaire avec les données reçues
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.error = "Impossible de charger les informations du profil.";
        this.isLoading = false;
      }
    });
  }

  /**
   * Bascule entre le mode lecture et le mode édition
   */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.clearMessages();

    // Si on annule, on réinitialise updatedUser avec les dernières données stables
    if (!this.isEditing && this.user) {
      this.updatedUser = { ...this.user };
    }
  }

  /**
   * Envoie les modifications au serveur
   */
  saveProfile(): void {
    // Validation simple : le nom est obligatoire
    if (!this.updatedUser.name || this.updatedUser.name.trim() === '') {
      this.error = "Le nom complet est requis.";
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    this.profileService.updateProfile(this.updatedUser).subscribe({
      next: (response: UpdateProfileResponse) => {
        // Extraction de l'utilisateur depuis la clé 'user' de la réponse JSON de Laravel
        this.user = response.user;
        this.updatedUser = { ...this.user };
        
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = response.message || "Profil mis à jour avec succès !";
        
        // Efface le message de succès après 5 secondes
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.isSaving = false;
        // Tente de récupérer le message d'erreur du backend, sinon message par défaut
        this.error = err.error?.message || "Échec de la mise à jour du profil. Veuillez réessayer.";
      }
    });
  }

  /**
   * Réinitialise les messages d'alerte
   */
  private clearMessages(): void {
    this.successMessage = null;
    this.error = null;
  }
}