import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, RevenueReport, MonthlyRevenue } from '../reports/report.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  
  revenueReport: RevenueReport | null = null;
  isLoading = false;
  error: string | null = null;
  
  // Filtres
  startDate: string = '';
  endDate: string = '';

  // Pour le graphique (affichage simple en liste pour l'instant)
  monthlyData: MonthlyRevenue[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    // Charge les données par défaut (toutes les périodes) au démarrage
    this.fetchRevenueReport();
  }

  fetchRevenueReport(): void {
    this.isLoading = true;
    this.error = null;
    this.revenueReport = null;
    this.monthlyData = [];

    this.reportService.getRevenueReport(this.startDate, this.endDate).subscribe({
      next: (report) => {
        this.revenueReport = report;
        this.monthlyData = report.monthly_breakdown;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors du chargement du rapport:", err);
        this.error = 'Erreur lors du chargement du rapport de revenus. Vérifiez l\'accès API ou les filtres.';
        this.isLoading = false;
      }
    });
  }
  
  // Méthode pour appliquer les filtres via le formulaire HTML
  applyFilters(): void {
    // Une simple vérification de base des dates avant l'appel API
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        this.error = "La date de début ne peut pas être postérieure à la date de fin.";
        return;
    }
    this.fetchRevenueReport();
  }
}