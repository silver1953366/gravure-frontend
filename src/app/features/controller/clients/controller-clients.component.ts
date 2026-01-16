// src/app/features/controller/clients/controller-clients.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ControllerClientService, ClientUser } from './controller-client.service';

@Component({
  selector: 'app-controller-clients',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './controller-clients.component.html',
  styleUrls: ['./controller-clients.component.css']
})
export class ControllerClientsComponent implements OnInit {

    clients: ClientUser[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private clientService: ControllerClientService
    ) { }

    ngOnInit(): void {
        this.fetchClients();
    }

    fetchClients(): void {
        this.isLoading = true;
        this.clientService.getClients().subscribe({
            next: (data) => {
                // Filtrer par rôle si l'API retourne tous les utilisateurs
                this.clients = data.filter(u => u.role === 'CLIENT'); 
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des clients", err);
                this.error = "Impossible de charger la liste des clients.";
                this.isLoading = false;
            }
        });
    }

    // Le Controller ne navigue que vers la consultation (pas de /clients/:id/edit)
    goToClientOrders(clientId: number): void {
        // Logique de navigation pour voir les commandes/devis de ce client.
        console.log(`Naviguer pour voir les commandes du client #${clientId}`);
    }
}