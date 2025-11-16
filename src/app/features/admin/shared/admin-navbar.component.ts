import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
// Supposons que Notification et NotificationService sont définis
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {

    user: any = { name: 'Admin Principal', role: 'Administrateur' }; 
    // Utiliser un mock Observable si le service réel n'est pas encore câblé
    unreadNotifications$: Observable<Notification[]> = of([]); 
    showNotificationDropdown = false;

    constructor( 
        private notificationService: NotificationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Décommenter ceci lorsque le NotificationService est prêt pour l'Admin
        // this.unreadNotifications$ = this.notificationService.getUnreadAdminNotifications(); 
    }
    
    toggleNotificationDropdown(): void {
        this.showNotificationDropdown = !this.showNotificationDropdown;
    }

    // Simplifié pour la démo: cette méthode devrait appeler l'API
    markAsRead(notification: Notification, event: Event): void {
        event.stopPropagation(); 
        console.log(`Marquer la notification #${notification.id} comme lue.`);
        // this.notificationService.markAsRead(notification.id).subscribe(...)
    }

    onLogout(): void {
        // Remplacer par l'appel à votre AuthService
        console.log("Déconnexion simulée.");
        this.router.navigate(['/login']); 
    }
}