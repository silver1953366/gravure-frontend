import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Composants standalone réutilisés
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,      // pour *ngFor, *ngIf, date, currency
    SidebarComponent,  // sidebar réutilisable
    NavbarComponent    // navbar réutilisable
  ]
})
export class DashboardComponent implements AfterViewInit {

  totalUsers = 120;
  ordersInProgress = 15;
  pendingQuotes = 8;
  monthlyRevenue = 4500;

  recentOrders = [
    { id: 101, client: 'Jean Dupont', product: 'Plaque métal', status: 'En cours', date: new Date() },
    { id: 102, client: 'Marie Claire', product: 'Plaque bois', status: 'Livrée', date: new Date() },
    { id: 103, client: 'Pierre Martin', product: 'Plaque verre', status: 'En cours', date: new Date() },
  ];

  ngAfterViewInit(): void {
    // Chart Commandes
    const ordersCtx = document.getElementById('ordersChart') as HTMLCanvasElement;
    new Chart(ordersCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{ label: 'Commandes', data: [12, 19, 8, 14, 20, 16], backgroundColor: '#4a90e2' }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Chart Devis
    const quotesCtx = document.getElementById('quotesChart') as HTMLCanvasElement;
    new Chart(quotesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{ label: 'Devis', data: [5, 7, 4, 8, 6, 10], borderColor: '#ff7f50', backgroundColor: 'rgba(255,127,80,0.2)', tension: 0.3 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}
