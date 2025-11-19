import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../users.service';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; // Nécessaire pour les inputs/selects, même non utilisés ici

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule], 
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
      private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchUsers();
    }

    fetchUsers(): void {
        this.isLoading = true;
        this.error = null;
        this.userService.getUsers().subscribe({
            next: (data) => {
                // 🥇 Tri des utilisateurs par ID décroissant (du plus récent au plus ancien)
                this.users = data.sort((a, b) => b.id - a.id); 
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des utilisateurs", err);
                this.error = 'Impossible de charger la liste des utilisateurs. Accès Admin requis.';
                this.isLoading = false;
            }
        });
    }

    onDeleteUser(userId: number): void {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
            this.userService.deleteUser(userId).subscribe({
                next: () => {
                    this.users = this.users.filter(u => u.id !== userId);
                    console.log(`Utilisateur ${userId} supprimé.`);
                },
                error: (err) => {
                    console.error("Erreur de suppression", err);
                    alert("Erreur lors de la suppression de l'utilisateur. Vérifiez les permissions.");
                }
            });
        }
    }

    // ➡️ Route conservée : /admin/users/edit/:id
    onEditUser(userId: number): void {
        this.router.navigate(['/admin/users/edit', userId]);
    }
    
    onCreateUser(): void {
        this.router.navigate(['/admin/users/create']);
    }
}