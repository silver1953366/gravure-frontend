import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces pour typer les données ---

export interface DashboardStats {
  activeQuotes: number;      // Devis en attente
  pendingOrders: number;     // Commandes en cours
  totalRevenue: number;      // Chiffre d'affaires total
  inventoryAlerts: number;   // Articles en rupture/seuil bas
}

export interface ChartData {
  period: string[];          // Ex: ['Jan', 'Fev', 'Mar']
  revenue: number[];         // Ex: [150000, 250000, 180000]
}

export interface AdminActivity {
  id: string;
  reference: string;         // REF-123
  action: string;            // 'quote_created', 'order_paid', etc.
  details: string;           // "Mise à jour du stock..."
  user: string;              // "Admin Jean"
  created_at: string | Date;
  status: 'pending' | 'processing' | 'completed' | 'alert';
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /**
   * Récupère les compteurs globaux pour les cartes du haut
   */
  getStatsCards(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  /**
   * Récupère les données pour le graphique de performance
   * @param period 'week' | 'month' | 'year'
   */
  getRevenueChartData(period: string = 'month'): Observable<ChartData> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ChartData>(`${this.apiUrl}/reports/revenue`, { params });
  }

  /**
   * Récupère le journal d'activité récent
   * @param limit Nombre de résultats à remonter
   */
  getRecentActivity(limit: number = 50): Observable<AdminActivity[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<AdminActivity[]>(`${this.apiUrl}/activities`, { params });
  }

  /**
   * Méthode utilitaire pour exporter les rapports (Exemple)
   */
  exportReport(type: 'pdf' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/export?format=${type}`, {
      responseType: 'blob'
    });
  }
}