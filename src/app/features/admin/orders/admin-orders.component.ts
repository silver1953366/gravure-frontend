import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionService } from '../../../core/services/transaction.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe, 
    DecimalPipe, 
    UpperCasePipe, 
    SlicePipe,
    FormsModule, 
    RouterModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {

  // --- Données ---
  orders: Order[] = [];
  
  // --- Filtres et Tri ---
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'desc'; // Tri décroissant (plus récent d'abord)
  
  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 8;

  // --- États UI ---
  isLoading: boolean = true;
  isProcessing: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  // --- Configuration des statuts pour l'affichage ---
  availableStatuses = [
    { value: 'pending_payment', label: 'ATTENTE PAIEMENT' },
    { value: 'processing', label: 'EN PRÉPARATION' },
    { value: 'ready_for_pickup', label: 'PRÊT À ENLEVER' },
    { value: 'completed', label: 'TERMINÉE' },
    { value: 'cancelled', label: 'ANNULÉE' }
  ];

  statusLabels: Record<string, string> = {
    'pending_payment': 'Attente Paiement',
    'processing': 'En Préparation',
    'ready_for_pickup': 'Prêt à Enlever',
    'completed': 'Terminée',
    'cancelled': 'Annulée'
  };

  constructor(
    private transactionService: TransactionService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Récupère toutes les commandes depuis le service
   */
  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.transactionService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur de chargement des commandes:', err);
        this.error = 'Impossible de charger la liste des commandes. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // LOGIQUE DE FILTRAGE ET TRI (Calculée)
  // ==========================================

  /**
   * Retourne la liste filtrée par référence, nom client ou ID
   */
  get filteredOrders(): Order[] {
    // 1. Filtrage
    let result = this.orders.filter(order => {
      const search = this.searchTerm.toLowerCase();
      const referenceMatch = order.reference?.toLowerCase().includes(search);
      const nameMatch = order.user?.name?.toLowerCase().includes(search);
      const idMatch = order.id.toString().includes(search);
      return referenceMatch || nameMatch || idMatch;
    });

    // 2. Tri par date (created_at)
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }

  /**
   * Retourne uniquement les éléments de la page actuelle
   */
  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Calcul du nombre total de pages
   */
  get totalPages(): number {
    const count = this.filteredOrders.length;
    return count > 0 ? Math.ceil(count / this.itemsPerPage) : 1;
  }

  /**
   * Inverse l'ordre de tri
   */
  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.currentPage = 1; 
  }

  // ==========================================
  // ACTIONS ADMINISTRATIVES
  // ==========================================

  /**
   * Navigation vers la page de détail d'une commande
   */
  goToDetails(id: number): void {
    this.router.navigate(['/admin/orders', id]);
  }

  /**
   * Gère le changement de statut via le menu déroulant
   */
  onStatusChange(order: Order, newStatus: string): void {
    if (order.status === newStatus) return;

    const label = this.statusLabels[newStatus] || newStatus;
    const confirmMessage = `Changer le statut de la commande #${order.reference || order.id} à "${label.toUpperCase()}" ?`;
    
    if (!confirm(confirmMessage)) {
      this.loadOrders(); // Reset l'UI en rechargeant
      return;
    }

    this.isProcessing = true;
    this.error = null;

    this.transactionService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder: Order) => {
        // Mise à jour locale
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        
        this.showFeedback(`Commande mise à jour : ${label}.`);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur mise à jour statut:', err);
        this.error = `Erreur lors de la modification de la commande.`;
        this.isProcessing = false;
        this.loadOrders();
      }
    });
  }

  private showFeedback(message: string): void {
    this.successMessage = message;
    this.isProcessing = false;
    setTimeout(() => this.successMessage = null, 4000);
  }
}