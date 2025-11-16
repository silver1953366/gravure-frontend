import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../users.service';
import { CommonModule } from '@angular/common'; // Pour *ngIf, *ngFor, pipe date
import { Router, RouterModule } from '@angular/router'; // Pour la navigation

@Component({
    standalone: true, // Mode Standalone
    imports: [CommonModule, RouterModule], 
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    users: User[] = [];
    isLoading = true;
    error: any = null;

    constructor(
      private userService: UserService,
      private router: Router // Injection du Router pour la navigation
    ) {}

    ngOnInit(): void {
        this.fetchUsers();
    }

    fetchUsers(): void {
        this.isLoading = true;
        this.error = null;
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des utilisateurs", err);
                this.error = 'Impossible de charger la liste des utilisateurs. Accès Admin requis.';
                this.isLoading = false;
            }
        });
    }

    // Gère la suppression d'un utilisateur
    onDeleteUser(userId: number): void {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
            this.userService.deleteUser(userId).subscribe({
                next: () => {
                    this.users = this.users.filter(u => u.id !== userId);
                    console.log(`Utilisateur ${userId} supprimé.`);
                    // Ajoutez ici votre logique de notification (Toastr, MatSnackBar, etc.)
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression de l'utilisateur. Vérifiez les permissions.");
                }
            });
        }
    }

    // Méthode pour naviguer vers le formulaire d'édition
    onEditUser(userId: number): void {
        this.router.navigate(['/admin/users/edit', userId]);
    }
    
    // Méthode pour naviguer vers le formulaire de création
    onCreateUser(): void {
        this.router.navigate(['/admin/users/create']);
    }
}