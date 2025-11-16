// src/app/features/client/profile/user-profile/client-user-profile.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientUserProfileService, ClientUser } from '../../client-user-profile.service';

@Component({
  selector: 'app-client-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-user-profile.component.html',
  styleUrls: ['./client-user-profile.component.css']
})
export class ClientUserProfileComponent implements OnInit {

    user: ClientUser | null = null;
    updatedUser: Partial<ClientUser> = {};
    isLoading = true;
    isEditing = false;
    error: string | null = null;
    successMessage: string | null = null;

    constructor(private profileService: ClientUserProfileService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.profileService.getProfile().subscribe({
            next: (data) => {
                this.user = data;
                this.updatedUser = { ...data }; // Clone les données pour le formulaire
                this.isLoading = false;
            },
            error: (err) => {
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
                this.error = "Échec de la mise à jour du profil. Veuillez réessayer.";
            }
        });
    }
}