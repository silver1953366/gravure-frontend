import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

// Services
import { AdminDashboardService, AdminActivity, DashboardStats } from './admin-dashboard.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // --- Injections ---
  private dashboardService = inject(AdminDashboardService);
  private authService = inject(AuthService);

  // --- Données Utilisateur (Résout l'erreur 'user') ---
  user = this.authService.currentUser;
  today: Date = new Date();

  // --- États (Signals) ---
  isLoading = signal<boolean>(true);
  stats = signal<DashboardStats | null>(null);
  allActivities = signal<AdminActivity[]>([]);
  filterStatus = signal<string>('all'); // 'all' | 'pending' | 'completed' | 'alert'
  activeMenuId = signal<string | null>(null);

  // --- Pagination ---
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);

  // --- Logique de Filtrage Réactive ---
  filteredActivities = computed(() => {
    const activities = this.allActivities();
    const filter = this.filterStatus();
    
    if (filter === 'all') return activities;
    return activities.filter(act => act.status === filter);
  });

  // --- Pagination Réactive ---
  paginatedActivities = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.filteredActivities().slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredActivities().length / this.pageSize()) || 1);
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Charge les statistiques et le journal d'activité
   */
  loadDashboardData(): void {
    this.isLoading.set(true);
    
    // Chargement des cartes de stats
    this.dashboardService.getStatsCards().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Erreur lors de la récupération des statistiques:', err)
    });

    // Chargement de l'activité avec indicateur de fin
    this.dashboardService.getRecentActivity(50)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.allActivities.set(data),
        error: (err) => console.error('Erreur lors de la récupération des activités:', err)
      });
  }

  // --- Actions & Navigation ---

  setFilter(status: string): void {
    this.filterStatus.set(status);
    this.currentPage.set(1); // Reset la page au changement de filtre
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  /**
   * Gère l'ouverture du menu "..." par ligne
   */
  toggleMenu(event: Event, id: string): void {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  /**
   * Ferme les menus ouverts lors d'un clic n'importe où sur le document
   */
  @HostListener('document:click')
  closeMenus(): void {
    this.activeMenuId.set(null);
  }

  // --- Méthodes d'action (Logique métier) ---

  viewDetails(activity: AdminActivity): void {
    console.log('Consultation de la référence:', activity.reference);
    // Exemple: this.router.navigate(['/admin/details', activity.id]);
  }

  approveActivity(activity: AdminActivity): void {
    console.log('Approbation de l\'activité:', activity.id);
    // Ajoutez ici l'appel service pour mettre à jour le statut en base
  }

  deleteActivity(activity: AdminActivity): void {
    if (confirm(`Confirmez-vous la suppression de la référence ${activity.reference} ?`)) {
      // Suppression locale (optimiste) en attendant l'appel API
      this.allActivities.update(list => list.filter(a => a.id !== activity.id));
    }
  }
}