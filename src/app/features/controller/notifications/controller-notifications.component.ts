// src/app/features/controller/notifications/notification-list/controller-notification-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ControllerNotificationService, Notification } from './controller-notification.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-controller-notification-list',
    templateUrl: './controller-notifications.component.html',
    styleUrls: ['./controller-notifications.component.css']
})
export class ControllerNotificationListComponent implements OnInit {
    
    notifications: Notification[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private notificationService: ControllerNotificationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchNotifications();
    }

    fetchNotifications(): void {
        this.isLoading = true;
        this.error = null;
        this.notificationService.getNotifications().subscribe({
            next: (data) => {
                this.notifications = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = "Erreur de chargement des notifications.";
                this.isLoading = false;
            }
        });
    }

    markAsRead(notification: Notification): void {
        if (notification.read) {
            // Si déjà lu, naviguer directement si un lien existe
            if (notification.link_url) this.router.navigate([notification.link_url]);
            return;
        }

        this.notificationService.markAsRead(notification.id).subscribe({
            next: () => {
                notification.read = true;
                // Naviguer après avoir marqué comme lu
                if (notification.link_url) {
                    // Supprime le premier slash si l'URL est absolue
                    const route = notification.link_url.startsWith('/') ? notification.link_url.substring(1) : notification.link_url;
                    this.router.navigate([route]);
                }
            },
            error: (err) => {
                alert("Impossible de marquer comme lu ou d'accéder à la ressource.");
            }
        });
    }
}