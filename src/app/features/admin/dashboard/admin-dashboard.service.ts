// src/app/features/admin/services/admin-dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces du Dashboard (Conservées) ---
export interface DashboardStats {
    totalUsers: number;
    activeQuotes: number; 
    pendingOrders: number; 
    totalRevenue: number; 
    inventoryAlerts: number; 
}

export interface ChartData {
    period: string[]; 
    revenue: number[];
}

@Injectable({
    // Le service est toujours fourni à la racine, mais sa localisation est logique.
    providedIn: 'root' 
})
// Le service est renommé pour refléter sa spécificité Admin
export class AdminDashboardService { 
    
    private readonly dashboardUrl = `${environment.apiUrl}/admin/dashboard`;
    private readonly reportsUrl = `${environment.apiUrl}/admin/reports`;

    constructor(private http: HttpClient) {}

    /** GET: Récupère les cartes de statistiques principales (Admin). */
    getStatsCards(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.dashboardUrl}/stats`);
    }
    
    /** GET: Récupère les données pour un graphique de revenus (Admin). */
    getRevenueChartData(period: 'month' | 'year' = 'month'): Observable<ChartData> {
        return this.http.get<ChartData>(`${this.reportsUrl}/revenue?period=${period}`);
    }

    /** GET: Récupère les 5 dernières activités système (Admin). */
    getRecentActivity(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/admin/activities?limit=5`);
    }
}