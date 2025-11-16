import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/client/order.service';
import { Order } from '../../../../core/models/order.model';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-order-list',
  standalone: true,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
  imports: [CommonModule, RouterLink, DatePipe, HttpClientModule] // HttpClientModule nécessaire si OrderService n'est pas fourni dans 'root'
})
export class OrderListComponent implements OnInit {
  
  private orderService = inject(OrderService);
  
  orders = signal<Order[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur de chargement des commandes", err);
        this.error.set("Impossible de charger la liste de vos commandes. Veuillez réessayer.");
        this.isLoading.set(false);
      }
    });
  }
  
  // Fonction utilitaire pour le style (optionnel, basé sur Tailwind/CSS)
 getStatusClass(status: Order['status']): string {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending_payment':
        return 'status-pending_payment';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'completed':
        return 'status-completed';
      case 'canceled':
        return 'status-canceled';
      default:
        return 'bg-gray-50 text-gray-600'; // Reste pour les cas non gérés
    }
  }
}