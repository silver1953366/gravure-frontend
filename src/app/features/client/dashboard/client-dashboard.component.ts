// src/app/features/client/dashboard/client-dashboard.component.ts (MIS À JOUR)

import { ChangeDetectionStrategy, Component, signal, computed, LOCALE_ID, OnInit, DestroyRef, inject } from '@angular/core';
// Importez ces éléments, mais ils doivent aussi être dans le tableau imports ci-dessous
import { DatePipe, NgClass, NgFor, NgIf, CurrencyPipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
// Importez vos services et modèles ici (exemples)
import { FavoritesService, FavoriteItem } from '../favorites/favorites.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Importez les vrais composants si ce sont des composants Angular Standalone
// (Sinon, laissez-les commentés si ce sont des placeholders pour des éléments HTML non-Angular)
// import { ClientSidebarComponent } from '...';
// import { ClientNavbarComponent } from '...';
// import { ClientFooterComponent } from '...';
const ClientSidebarComponent = 'app-client-sidebar';
const ClientNavbarComponent = 'app-client-navbar';
const ClientFooterComponent = 'app-client-footer';


@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
  standalone: true,
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    // 🟢 AJOUTÉ : Fourniture explicite des pipes si nécessaire pour l'injection
    DatePipe, 
    CurrencyPipe
  ],
  imports: [
    RouterLink,
    
    // 🟢 CORRECTION NG8004 (date, currency) & NG8002 (ngClass) : 
    // Il faut importer explicitement les pipes et directives dans les composants Standalone.
    NgIf,
    NgFor,
    NgClass,        // Permet d'utiliser [ngClass]
    DatePipe,       // Permet d'utiliser le pipe | date
    CurrencyPipe,   // Permet d'utiliser le pipe | currency

    // Note: Remplacez ces chaînes par les vrais composants si ce ne sont pas des exemples
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDashboardComponent implements OnInit {
  
  private destroyRef = inject(DestroyRef); 
  // ... (Le reste de la classe reste inchangé)

  // --- STATE AND DATA ---
  
  favourites = signal<FavoriteItem[]>([]);
  isLoadingFavorites = signal(true);
  isSidebarOpen = signal(true);
  userName: string = 'Jean Dubois';
  memberSince: Date = new Date(2022, 5, 15);
  isLoading: boolean = false; 

  // Order Tracker Data
  orderStages = [
    { label: 'Projet créé', details: '24 Jan 2024' },
    { label: 'Design validé', details: '28 Jan 2024' },
    { label: 'Gravure en cours', details: 'En production' },
    { label: 'Expédition imminente', details: 'Prochainement' },
  ];
  
  latestOrderTracker = {
    title: 'Plaque d\'inauguration',
    product: 'Laiton Brossé 30x40cm',
    eta: new Date(2024, 2, 10),
    status: 'Gravure en cours'
  };
  
  // Quotes Data
  quotes = [
    { id: 'QT-9821', name: 'Plaques Bureau RDC', status: 'Approved', updatedAt: new Date(2024, 0, 30) },
    { id: 'QT-9820', name: 'Signalétique Entrepôt', status: 'Pending', updatedAt: new Date(2024, 0, 25) },
    { id: 'QT-9819', name: 'Cartes Visite PVC', status: 'Draft', updatedAt: new Date(2024, 0, 20) },
    { id: 'QT-9818', name: 'Plaque Salle Réunion', status: 'Approved', updatedAt: new Date(2023, 11, 15) },
  ];
  
  // Cart Summary Data
  cartSummary = {
    items: 4,
    amount: 14250,
    currency: 'EUR'
  };

  // Status mapping for CSS classes
  statusChipClasses: { [key: string]: string } = {
    'Draft': 'draft',
    'Pending': 'pending',
    'Approved': 'approved',
    'Ordered': 'ordered',
  };


  constructor(private favoritesService: FavoritesService) {
    // Les computed signals accèdent aux signaux locaux
  }
  
  ngOnInit(): void {
    this.loadFavorites();
  }

  // --- LOGIQUE DU SERVICE ---

  loadFavorites(): void {
    this.isLoadingFavorites.set(true);
    this.favoritesService.getFavorites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          // Transformation des données pour l'affichage
          const transformedItems = items.map(item => ({
            ...item,
            image: item.quote.image_url || `https://placehold.co/160x120/4B5563/FFFFFF?text=${item.quote.reference}`
          }));
          this.favourites.set(transformedItems);
          this.isLoadingFavorites.set(false);
        },
        error: (err) => {
          console.error("Erreur lors du chargement des favoris", err);
          this.isLoadingFavorites.set(false);
        }
      });
  }

  relaunchConfiguration(quoteId: number): void {
    console.log(`Relancer la configuration pour le Devis ID: ${quoteId}`);
    // Logique de navigation (ex: router.navigate(['/config', quoteId]))
  }


  // --- COMPUTED SIGNALS et METHODS ---

  activeStageIndex = computed(() => {
    const status = this.latestOrderTracker.status;
    const index = this.orderStages.findIndex(stage => stage.label === status);
    return index > -1 ? index : 0; 
  });

  timelineProgress = computed(() => {
    const totalStages = this.orderStages.length;
    const progress = (this.activeStageIndex() + 1) / totalStages * 100;
    return progress > 100 ? 100 : progress;
  });
  
  toggleSidebar() {
    this.isSidebarOpen.update(current => !current);
  }

  getQuoteActionText(quote: { status: string }): string {
    switch (quote.status) {
      case 'Draft':
        return 'Finaliser';
      case 'Pending':
      case 'Ordered':
        return 'Télécharger';
      case 'Approved':
        return 'Convertir en Cde';
      default:
        return 'Voir Détails';
    }
  }
}