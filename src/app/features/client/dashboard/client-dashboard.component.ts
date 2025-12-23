import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { CartService } from '../../../core/services/cart.service';
import { ClientQuoteService } from '../../../core/services/client/client-quote.service';
import { OrderService } from '../../../core/services/client/order.service'; 
import { Quote } from '../../../core/models/client/quotes/quote.model';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private quoteService = inject(ClientQuoteService);
  private orderService = inject(OrderService);

  today: Date = new Date();
  user = this.authService.currentUser;
  
  favourites = signal<any[]>([]);
  allActivities = signal<any[]>([]); 
  filterType = signal<'all' | 'quote' | 'order'>('all');

  // --- PAGINATION ---
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  activeMenuId = signal<string | null>(null);

  // Stats simplifiées
  cartCount = computed(() => (this.cartService as any).itemCount?.() || 0);
  cartTotal = computed(() => (this.cartService as any).totalAmount?.() || 0);
  quoteCount = computed(() => this.allActivities().filter(a => a.type === 'quote').length);
  orderCount = computed(() => this.allActivities().filter(a => a.type === 'order').length);

  // 1. Filtrage par type
  filteredActivities = computed(() => {
    const list = this.allActivities();
    if (this.filterType() === 'all') return list;
    return list.filter(item => item.type === this.filterType());
  });

  // 2. Découpage pour la pagination (5 par page)
  paginatedActivities = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.filteredActivities().slice(startIndex, startIndex + this.pageSize());
  });

  // 3. Calcul des pages
  totalPages = computed(() => Math.ceil(this.filteredActivities().length / this.pageSize()) || 1);
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.favoritesService.getFavorites().pipe(catchError(() => of([]))).subscribe(data => this.favourites.set(data));

    forkJoin({
      quotes: this.quoteService.getQuotes().pipe(catchError(() => of([]))),
      orders: this.orderService.getOrders().pipe(catchError(() => of([])))
    }).subscribe(result => {
      const quotesMap = result.quotes.map((q: Quote) => ({
        id: q.reference || `DEV-${q.id}`,
        name: q.material?.name || 'Devis personnalisé',
        type: 'quote',
        status: q.status,
        date: q.updated_at,
        amount: q.final_price_fcfa,
        rawId: q.id // Utilisé pour le lien de redirection
      }));

      const ordersMap = result.orders.map((o: Order) => ({
        id: o.reference || `CMD-${o.id}`,
        name: o.material?.name || 'Commande signalétique',
        type: 'order',
        status: o.status,
        date: o.created_at,
        amount: o.final_price_fcfa,
        rawId: o.id
      }));

      const combined = [...quotesMap, ...ordersMap].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.allActivities.set(combined);
    });
  }

  // Navigation
  setFilter(type: 'all' | 'quote' | 'order') {
    this.filterType.set(type);
    this.currentPage.set(1); // Reset à la page 1 lors du filtrage
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Menu "..."
  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() { this.activeMenuId.set(null); }

  // Libellés et Styles
  translateStatus(status: string): string {
    const translations: any = {
      'draft': 'Brouillon', 'sent': 'Envoyé', 'calculated': 'Calculé',
      'ordered': 'Commandé', 'pending_payment': 'En attente', 'paid': 'Payé',
      'processing': 'En cours', 'shipped': 'Expédié', 'completed': 'Livré', 'canceled': 'Annulé'
    };
    return translations[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = { 
      'calculated': 'status-info', 'ordered': 'status-success', 'paid': 'status-success',
      'completed': 'status-success', 'processing': 'status-warning', 'pending_payment': 'status-danger'
    };
    return map[status] || 'status-neutral';
  }

  openCart() { (this.cartService as any).openCartModal?.(); }
}