import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Ajout de CurrencyPipe pour le formatage
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
// CORRECTION ICI : Remonter deux niveaux (de features/client/dashboard vers app/)
import { LoaderComponent } from '../../../shared/components/loader/loader.component'; // Chemin d'accès corrigé

// ... le reste du code reste identique

// --- Définition des Types (Modèles de données) ---

type QuoteStatus = "Brouillon" | "En attente" | "Accepté";

interface Quote {
  id: string;
  name: string;
  status: QuoteStatus;
  updatedAt: string;
}

interface FavouriteProduct {
  id: string;
  name: string;
  material: string;
  image: string;
  reference: string;
}

interface OrderStage {
  key: string;
  label: string;
}

interface CartSummary {
  items: number;
  amount: number;
  currency: string;
}

const ORDER_STAGES_DATA: OrderStage[] = [
  { key: "validation", label: "Validation" },
  { key: "production", label: "En production" },
  { key: "qa", label: "Contrôle qualité" },
  { key: "shipping", label: "Expédié" },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Ajout de CurrencyPipe, HttpClientModule et LoaderComponent
  imports: [CommonModule, RouterModule, HttpClientModule, LoaderComponent, CurrencyPipe], 
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  // --- Configuration API ---
  // Utilisation de localhost:8000/api par défaut (Standard Laravel)
  private readonly API_BASE_URL = 'http://localhost:8000/api'; 
  
  // --- État de Chargement & Données ---
  isLoading: boolean = true;
  
  quotes: Quote[] = [];
  favourites: FavouriteProduct[] = [];
  orderStages: OrderStage[] = ORDER_STAGES_DATA;
  cartSummary: CartSummary = { items: 0, amount: 0, currency: "EUR" };

  // --- Timeline (Simulée) ---
  timelineProgress: number = 12;
  activeStageIndex: number = 0;
  private timelineInterval: any;

  // Map pour les classes CSS des statuts
  statusChipClasses: Record<QuoteStatus, string> = {
    "Brouillon": "draft",
    "En attente": "pending",
    "Accepté": "approved",
  };

  // Injection du HttpClient
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.startTimelineAnimation();
  }

  ngOnDestroy(): void {
    if (this.timelineInterval) {
      clearInterval(this.timelineInterval);
    }
  }

  /**
   * Charge les données du dashboard via les appels HTTP au backend.
   * Utilise les routes confirmées : /api/quotes et /api/favorites.
   * Hypothèse : /api/cart/summary pour l'agrégat.
   */
  loadDashboardData(): void {
    this.isLoading = true;
    let dataLoadedCount = 0;
    const expectedLoads = 3;

    const checkAllLoaded = () => {
        dataLoadedCount++;
        if (dataLoadedCount === expectedLoads) {
            this.isLoading = false;
        }
    };

    // 1. Charger les Devis (GET /api/quotes)
    this.http.get<Quote[]>(`${this.API_BASE_URL}/quotes`).subscribe({
      next: (data) => {
        this.quotes = data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
        checkAllLoaded();
      },
      error: (err) => {
        console.error("Erreur lors du chargement des devis:", err);
        this.quotes = []; 
        checkAllLoaded();
      }
    });

    // 2. Charger les Favoris (GET /api/favorites)
    this.http.get<FavouriteProduct[]>(`${this.API_BASE_URL}/favorites`).subscribe({
      next: (data) => {
        this.favourites = data.slice(0, 4);
        checkAllLoaded();
      },
      error: (err) => {
        console.error("Erreur lors du chargement des favoris:", err);
        this.favourites = [];
        checkAllLoaded();
      }
    });

    // 3. Charger le Résumé du Panier (GET /api/cart/summary)
    // ATTENTION: Ceci est une route hypothétique car non définie dans api.php
    this.http.get<CartSummary>(`${this.API_BASE_URL}/cart/summary`).subscribe({
      next: (data) => {
        this.cartSummary = data;
        checkAllLoaded();
      },
      error: (err) => {
        console.error("Erreur lors du chargement du panier:", err);
        this.cartSummary = { items: 0, amount: 0, currency: "EUR" };
        checkAllLoaded();
      }
    });
  }

  // --- Logique d'animation (identique) ---
  startTimelineAnimation(): void {
    const targetProgress = 76;
    
    this.timelineInterval = setInterval(() => {
      if (this.timelineProgress >= targetProgress) {
        this.timelineProgress = targetProgress;
        this.updateActiveStage();
        clearInterval(this.timelineInterval);
        return;
      }
      this.timelineProgress += 1.5;
      this.updateActiveStage();
    }, 120);
  }

  updateActiveStage(): void {
    const thresholds = [0, 30, 60, 90];
    let newIndex = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (this.timelineProgress >= thresholds[i]) {
        newIndex = i;
      }
    }
    this.activeStageIndex = newIndex;
  }

  getQuoteActionText(quote: Quote): string {
    switch (quote.status) {
      case "Accepté":
        return "Convertir en commande";
      case "Brouillon":
        return "Modifier";
      default:
        return "Relancer";
    }
  }
}