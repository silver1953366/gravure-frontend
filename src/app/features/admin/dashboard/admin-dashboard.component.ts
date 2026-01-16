import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, catchError, of, finalize } from 'rxjs';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { ReportService } from '../reports/report.service';
import { MaterialService } from '../materials/material.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private reportService = inject(ReportService);
  private materialService = inject(MaterialService);

  // --- États (Signals) ---
  user = this.authService.currentUser;
  today: Date = new Date();
  isLoading = signal<boolean>(true);
  
  // Données brutes
  allActivities = signal<any[]>([]);
  revenueData = signal<any>(null);
  inventoryAlertsCount = signal<number>(0);

  // UI
  filterStatus = signal<string>('all');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);
  activeMenuId = signal<string | null>(null);

  // --- Stats calculées pour les cartes du haut ---
  stats = computed(() => {
    const activities = this.allActivities();
    return {
      // Un devis est considéré "en attente" s'il est au statut pending ou envoyé (sent)
      activeQuotes: activities.filter(a => a.action === 'quote' && a.status === 'pending').length,
      // Une commande est "en attente" si elle est en cours de traitement
      pendingOrders: activities.filter(a => a.action === 'order' && a.status === 'pending').length,
      totalRevenue: this.revenueData()?.summary?.total_revenue_fcfa || 0,
      inventoryAlerts: this.inventoryAlertsCount()
    };
  });

  // --- Logique de filtrage et pagination ---
  filteredActivities = computed(() => {
    const list = this.allActivities();
    if (this.filterStatus() === 'all') return list;
    return list.filter(act => act.status === this.filterStatus());
  });

  paginatedActivities = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.filteredActivities().slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredActivities().length / this.pageSize()) || 1);
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      quotes: this.transactionService.getAllQuotes().pipe(catchError(() => of([]))),
      orders: this.transactionService.getAllOrders().pipe(catchError(() => of([]))),
      report: this.reportService.getRevenueReport().pipe(catchError(() => of(null))),
      materials: this.materialService.getMaterials().pipe(catchError(() => of([])))
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe(({ quotes, orders, report, materials }) => {
      
      // 1. Traitement des Devis (Correction Erreur 2367 sur les enums)
      const quotesMap = quotes.map((q: any) => ({
        id: q.id,
        reference: q.reference || `DEV-${q.id}`,
        action: 'quote',
        details: `Devis: ${q.material?.name || 'Projet personnalisé'}`,
        user: q.user?.name || 'Client',
        date: q.created_at,
        // On mappe les statuts backend vers des statuts UI simplifiés : pending | completed
        status: (q.status === 'sent' || q.status === 'calculated' || q.status === 'draft') ? 'pending' : 'completed',
        amount: q.final_price_fcfa
      }));

      // 2. Traitement des Commandes (Correction Erreur 2339 items_count)
      const ordersMap = orders.map((o: any) => ({
        id: o.id,
        reference: o.reference || `CMD-${o.id}`,
        action: 'order',
        details: `Commande: ${o.items?.length || 1} article(s)`,
        user: o.user?.name || 'Client',
        date: o.created_at,
        // On mappe les statuts backend : pending | completed | alert
        status: o.status === 'completed' ? 'completed' : (o.status === 'canceled' ? 'alert' : 'pending'),
        amount: o.final_price_fcfa
      }));

      // 3. Alertes stock (Correction Erreur 2339 stock_quantity/alert_threshold)
      const alerts = materials.filter((m: any) => {
        const stock = m.stock_quantity ?? 0;
        const threshold = m.alert_threshold ?? 10;
        return stock <= threshold;
      }).length;
      
      this.inventoryAlertsCount.set(alerts);

      // 4. Stockage du rapport financier
      this.revenueData.set(report);

      // 5. Fusion et tri chronologique
      const combined = [...quotesMap, ...ordersMap].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      this.allActivities.set(combined);
    });
  }

  // --- Méthodes d'interface ---
  setFilter(status: string): void {
    this.filterStatus.set(status);
    this.currentPage.set(1);
  }

  goToPage(page: number): void { 
    this.currentPage.set(page); 
  }

  toggleMenu(event: Event, id: any): void {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenus(): void { 
    this.activeMenuId.set(null); 
  }
}