import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, RevenueReport, MonthlyRevenue } from '../reports/report.service';

/**
 * Composant de reporting pour l'administration.
 * Gère l'affichage des revenus, du panier moyen et de la répartition mensuelle.
 */
@Component({
  standalone: true,
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  imports: [
    CommonModule, 
    FormsModule, 
    DecimalPipe, 
    DatePipe
  ]
})
export class ReportsComponent implements OnInit {
  
  // --- Données du Rapport ---
  revenueReport: RevenueReport | null = null;
  monthlyData: MonthlyRevenue[] = [];

  // --- États UI ---
  isLoading: boolean = false;
  error: string | null = null;
  
  // --- Filtres (Format YYYY-MM-DD pour les inputs type="date") ---
  startDate: string = '';
  endDate: string = '';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    // Initialisation avec les dates du mois actuel
    this.setDefaultDates();
    // Chargement initial des données
    this.fetchRevenueReport();
  }

  /**
   * Définit dynamiquement la période du 1er du mois en cours à aujourd'hui
   */
  private setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Formatage manuel en YYYY-MM-DD pour la compatibilité HTML5 input date
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(now);
  }

  /**
   * Helper pour formater une date en string ISO (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Appel au service pour récupérer les statistiques de revenus
   */
  fetchRevenueReport(): void {
    this.isLoading = true;
    this.error = null;

    this.reportService.getRevenueReport(this.startDate, this.endDate).subscribe({
      next: (report: RevenueReport) => {
        this.revenueReport = report;
        this.monthlyData = report.monthly_breakdown || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error("Erreur lors de la récupération du rapport:", err);
        this.error = "Impossible de générer le rapport. Vérifiez vos filtres ou la connexion au serveur.";
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Déclenché par le bouton de filtrage
   */
  applyFilters(): void {
    // Validation de cohérence des dates
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        this.error = "La date de début ne peut pas être postérieure à la date de fin.";
        return;
    }
    this.fetchRevenueReport();
  }

  /**
   * Calcule le pourcentage de performance par rapport au mois le plus élevé
   * (Utile pour la barre de progression visuelle dans le tableau)
   */
  getPerformanceWidth(currentRevenue: number): number {
    if (!this.monthlyData || this.monthlyData.length === 0) return 0;
    const maxRevenue = Math.max(...this.monthlyData.map(m => m.revenue));
    return maxRevenue > 0 ? (currentRevenue / maxRevenue) * 100 : 0;
  }
}