// src/app/features/controller/dashboard/controller-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interface pour simuler les données
interface DashboardStat {
    title: string;
    value: number | string;
    detail: string;
    link?: string;
    class?: string;
}

@Component({
  selector: 'app-controller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './controller-dashboard.component.html',
  styleUrls: ['./controller-dashboard.component.css']
})
export class ControllerDashboardComponent implements OnInit {
  
  stats: DashboardStat[] = [];
  quickActions: { label: string, link: string }[] = [];
  
  // NOTE: En production, ces données seraient chargées via un service dédié (ex: DashboardService)
  // et non pas codées en dur.

  ngOnInit(): void {
    this.loadStats();
    this.loadQuickActions();
  }

  loadStats(): void {
    this.stats = [
      { 
        title: 'Commandes à Lancer', 
        value: 8, // Ex: Commandes en statut 'paid'
        detail: 'Commandes payées, prêtes à passer en production.',
        link: '/controller/orders',
        class: 'stat-primary'
      },
      { 
        title: 'En Production', 
        value: 12, // Ex: Commandes en statut 'processing'
        detail: 'Commandes actuellement dans le flux de fabrication.',
        link: '/controller/orders',
        class: 'stat-processing'
      },
      { 
        title: 'Alertes Inventaire', 
        value: 3, // Ex: Matériaux sous le seuil critique
        detail: 'Articles en stock faible nécessitant un réapprovisionnement.',
        link: '/controller/inventory',
        class: 'stat-danger'
      },
      { 
        title: 'Devis Prêts à Commander', 
        value: 5, // Ex: Devis en statut 'calculated'
        detail: 'Devis avec prix finalisé, en attente de validation client.',
        link: '/controller/quotes',
        class: 'stat-info'
      }
    ];
  }

  loadQuickActions(): void {
    this.quickActions = [
      { label: 'Démarrer la production (Liste)', link: '/controller/orders' },
      { label: 'Vérifier les niveaux de stock', link: '/controller/inventory' },
      { label: 'Consulter les derniers devis', link: '/controller/quotes' },
    ];
  }
}