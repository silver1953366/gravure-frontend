import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../users.service';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule], 
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    // Sources de données
    users: User[] = [];
    filteredUsers: User[] = []; 
    
    // États de l'interface
    isLoading = true;
    error: string | null = null;

    // Filtres (liés via ngModel)
    searchTerm: string = '';
    roleFilter: string = '';

    // Pagination
    currentPage: number = 1;
    itemsPerPage: number = 10;

    constructor(
      private userService: UserService,
      private router: Router
    ) {}

    ngOnInit(): void {
        this.fetchUsers();
    }

    /**
     * Récupère les utilisateurs et initialise l'affichage
     */
    fetchUsers(): void {
        this.isLoading = true;
        this.error = null;
        this.userService.getUsers().subscribe({
            next: (data) => {
                // Tri initial : les plus récents en premier
                this.users = data.sort((a, b) => b.id - a.id); 
                this.applyFilters(); 
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement", err);
                this.error = 'Impossible de charger la liste des utilisateurs. Accès Admin requis.';
                this.isLoading = false;
            }
        });
    }

    /**
     * Logique de filtrage combinée (Recherche texte + Rôle)
     */
    applyFilters(): void {
        const search = this.searchTerm.toLowerCase().trim();
        
        this.filteredUsers = this.users.filter(user => {
            const matchesText = !search || 
                                user.name.toLowerCase().includes(search) || 
                                user.email.toLowerCase().includes(search);
            
            const matchesRole = !this.roleFilter || 
                                user.role === this.roleFilter;

            return matchesText && matchesRole;
        });

        // Revenir à la page 1 après chaque modification de filtre
        this.currentPage = 1;
    }

    /**
     * Retourne uniquement les utilisateurs de la page active
     */
    get paginatedUsers(): User[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
    }

    /**
     * Calcule le nombre total de pages
     */
    get totalPages(): number {
        return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
    }

    /**
     * Change la page actuelle
     */
    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            // Scroll fluide vers le haut du tableau pour l'UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // --- Actions Utilisateurs ---

    onDeleteUser(userId: number): void {
        if (confirm("🚨 Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
            this.userService.deleteUser(userId).subscribe({
                next: () => {
                    // Mise à jour locale sans rechargement API complet
                    this.users = this.users.filter(u => u.id !== userId);
                    this.applyFilters();
                },
                error: (err) => {
                    console.error("Erreur suppression", err);
                    alert("Erreur lors de la suppression. L'utilisateur est peut-être lié à d'autres données.");
                }
            });
        }
    }

    onEditUser(userId: number): void {
        this.router.navigate(['/admin/users/edit', userId]);
    }
    
    onCreateUser(): void {
        this.router.navigate(['/admin/users/create']);
    }
}