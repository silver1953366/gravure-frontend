// src/app/features/controller/profile/user-profile/controller-user-profile.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService, ControllerUser } from '../../user-profile.service';

@Component({
  selector: 'app-controller-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controller-user-profile.component.html',
  styleUrls: ['./controller-user-profile.component.css']
})
export class ControllerUserProfileComponent implements OnInit {

    user: ControllerUser | null = null;
    updatedUser: Partial<ControllerUser> = {};
    isLoading = true;
    isEditing = false;
    error: string | null = null;
    successMessage: string | null = null;

    constructor(private profileService: UserProfileService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.profileService.getProfile().subscribe({
            next: (data) => {
                this.user = data;
                this.updatedUser = { ...data }; // Initialise le formulaire
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement du profil", err);
                this.error = "Impossible de charger les informations du profil.";
                this.isLoading = false;
            }
        });
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        this.successMessage = null;
        this.error = null;
        if (!this.isEditing) {
            // Réinitialiser les données du formulaire si l'utilisateur annule
            this.updatedUser = { ...this.user! };
        }
    }

    saveProfile(): void {
        this.profileService.updateProfile(this.updatedUser).subscribe({
            next: (updatedData) => {
                this.user = updatedData;
                this.updatedUser = { ...updatedData };
                this.isEditing = false;
                this.successMessage = "Profil mis à jour avec succès!";
            },
            error: (err) => {
                this.error = "Échec de la mise à jour du profil.";
            }
        });
    }
}