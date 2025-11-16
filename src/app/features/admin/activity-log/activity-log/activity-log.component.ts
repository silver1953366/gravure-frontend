import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService, Activity, PaginatedActivities } from '../../activity/activity.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css']
})
export class ActivityLogComponent implements OnInit {
  
  activitiesData: PaginatedActivities | null = null;
  activities: Activity[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Pagination & Filtering
  currentPage = 1;
  filterUserId: number | null = null;
  filterAction: string = '';
  
  // Liste des actions communes pour le filtre
  commonActions = ['created', 'updated', 'deleted', 'login', 'logout', 'price_estimate', 'order_converted'];

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  fetchActivities(page: number = this.currentPage): void {
    this.isLoading = true;
    this.error = null;
    this.currentPage = page;

    this.activityService.getActivities(
        this.currentPage, 
        this.filterUserId || undefined, 
        this.filterAction || undefined
    ).subscribe({
      next: (data) => {
        this.activitiesData = data;
        this.activities = data.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur de chargement du journal d'activité:", err);
        this.error = 'Impossible de charger le journal d\'activité. Accès Admin requis.';
        this.isLoading = false;
      }
    });
  }
  
  applyFilters(): void {
      this.fetchActivities(1); // Retourne à la première page
  }
  
  onPageChange(page: number): void {
      if (page >= 1 && page <= (this.activitiesData?.last_page || 1)) {
          this.fetchActivities(page);
      }
  }
  
  // Fonction utilitaire pour extraire le nom du modèle (ex: 'App\Models\Order' devient 'Order')
  getModelName(modelType: string): string {
      const parts = modelType.split('\\');
      return parts[parts.length - 1];
  }
}