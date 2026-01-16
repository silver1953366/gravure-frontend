import { Routes } from '@angular/router';

// 1. Layout du Contrôleur (Parent)
import { ControllerLayoutComponent } from './shared/controller-layout.component'; 

// 2. Modules de Base
import { ControllerDashboardComponent } from './dashboard/controller-dashboard/controller-dashboard.component'; 
import { ControllerUserProfileComponent } from './profile/user-profile/controller-user-profile/controller-user-profile.component'; 

// 3. Gestion Commerciale (Orders & Quotes)
import { ControllerQuoteListComponent } from './quotes/quote-list/controller-quote-list/controller-quote-list.component'; 
import { ControllerOrderListComponent } from './orders/order-list/controller-order-list/controller-order-list.component';
import { ControllerOrderDetailComponent } from './orders/order-detail/controller-order-detail/controller-order-detail.component';

// 4. Production & Stock
import { ControllerInventoryListComponent } from './inventory/inventory-list/controller-inventory-list/controller-inventory-list.component';
import { ControllerCatalogueComponent } from './catalogue/controller-catalogue.component'; 

// 5. Autres (Clients & Notifications)
import { ControllerClientsComponent } from './clients/controller-clients.component'; 
import { ControllerNotificationListComponent } from './notifications/controller-notifications.component';

// Nous utilisons l'InventoryListComponent pour la démo, en supposant que le détail est géré sur la même page
const InventoryDetailComponent = ControllerInventoryListComponent; 

export const CONTROLLER_ROUTES: Routes = [
 {
 path: '',
        // Layout parent qui inclut la Sidebar et la Navbar
        component: ControllerLayoutComponent, 
        children: [
            // --- DASHBOARD (Route par défaut) ---
            { path: 'dashboard', component: ControllerDashboardComponent, title: 'Controller | Tableau de Bord' },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            
            // --- GESTION DES COMMANDES (PRODUCTION) ---
            { path: 'orders', component: ControllerOrderListComponent, title: 'Controller | Commandes' },
            { path: 'orders/:id', component: ControllerOrderDetailComponent, title: 'Controller | Détail Commande' },

            // --- DEVIS (CONSULTATION) ---
            { path: 'quotes', component: ControllerQuoteListComponent, title: 'Controller | Devis' },

            // --- INVENTAIRE & CATALOGUE ---
            { path: 'inventory', component: ControllerInventoryListComponent, title: 'Controller | Inventaire' },
            { path: 'inventory/:id', component: InventoryDetailComponent, title: 'Controller | Détail Inventaire' }, // Route simplifiée
            { path: 'catalogue', component: ControllerCatalogueComponent, title: 'Controller | Catalogue' },
            
            // --- CLIENTS & NOTIFICATIONS ---
            { path: 'clients', component: ControllerClientsComponent, title: 'Controller | Clients' },
            { path: 'notifications', component: ControllerNotificationListComponent, title: 'Controller | Notifications' },
            
            // --- PROFIL ---
            { path: 'profile', component: ControllerUserProfileComponent, title: 'Controller | Mon Profil' },
        ]
    }
];