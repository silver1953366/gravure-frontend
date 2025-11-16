// src/app/features/admin/dashboard/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 🛑 MISE À JOUR IMPORT : Utilise le service local à l'Admin
import { AdminDashboardService, DashboardStats, ChartData } from './admin-dashboard.service'; 

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

    stats: DashboardStats | null = null;
    revenueData: ChartData | null = null;
    recentActivities: any[] = [];
    isLoadingStats = true;
    isLoadingActivity = true;
    error: string | null = null;

    // 🛑 INJECTION : Utilisation du service renommé
    constructor(private dashboardService: AdminDashboardService) {}

    ngOnInit(): void {
        this.loadStats();
        this.loadRevenueChartData();
        this.loadRecentActivity();
    }

    /** Charge les cartes de statistiques clés. */
    loadStats(): void {
        this.isLoadingStats = true;
        // Appel au service AdminDashboardService
        this.dashboardService.getStatsCards().subscribe({
            next: (data) => {
                this.stats = data;
                this.isLoadingStats = false;
            },
            error: (err) => {
                this.error = 'Erreur lors du chargement des statistiques.';
                this.isLoadingStats = false;
                console.error('API Error:', err);
            }
        });
    }

    /** Charge les données pour un graphique (Simulation). */
    loadRevenueChartData(): void {
        this.dashboardService.getRevenueChartData().subscribe({
            next: (data) => {
                this.revenueData = data;
            },
            error: (err) => {
                console.error('Erreur graphique:', err);
            }
        });
    }

    /** Charge le journal d'activité récent. */
    loadRecentActivity(): void {
        this.isLoadingActivity = true;
        this.dashboardService.getRecentActivity().subscribe({
            next: (data) => {
                if (data.length === 0) {
                     this.recentActivities = [
                        { id: 3, action: 'material_dimension_created', details: 'Ajout nouvelle référence 120x60cm Acier Inox.', user: 'Admin Principal', created_at: new Date() },
                        { id: 2, action: 'order_status_updated', details: 'Commande #45 est passée à "processing".', user: 'Admin Secondaire', created_at: new Date(Date.now() - 3600000) }, 
                        { id: 1, action: 'user_registered', details: 'Nouvel utilisateur "Client Test" inscrit.', user: 'Système', created_at: new Date(Date.now() - 7200000) }, 
                     ];
                } else {
                    this.recentActivities = data;
                }
                this.isLoadingActivity = false;
            },
            error: (err) => {
                this.isLoadingActivity = false;
                console.error('Erreur journal:', err);
            }
        });
    }

    // Aide pour la mise en forme du label d'activité
    formatActivity(activity: any): string {
        switch(activity.action) {
            case 'material_dimension_created': return `[CATALOGUE] ${activity.user} a créé: ${activity.details}`;
            case 'order_status_updated': return `[COMMANDE] ${activity.user} a mis à jour: ${activity.details}`;
            case 'user_registered': return `[USER] ${activity.details}`;
            default: return `${activity.action}: ${activity.details}`;
        }
    }
}