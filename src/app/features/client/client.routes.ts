import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./shared/layout/client-layout.component').then(m => m.ClientLayoutComponent),
        children: [
            // --- Redirection par défaut ---
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // --- 1. TABLEAU DE BORD ---
            { 
                path: 'dashboard', 
                loadComponent: () => import('./dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
                title: 'YouMeet | Dashboard'
            },

            // --- 2. DEVIS (QUOTES) ---
            { 
                path: 'quotes', 
                loadComponent: () => import('./quotes/quote-list/quote-list.component').then(m => m.QuoteListComponent),
                title: 'Mes Devis'
            },
            { 
                path: 'quotes/create', 
                loadComponent: () => import('./quotes/quote-form/quote-form.component').then(m => m.QuoteFormComponent),
                title: 'Demander un Devis'
            },
            { 
                path: 'quotes/:id', 
                loadComponent: () => import('./quotes/quote-detail/quote-detail.component').then(m => m.QuoteDetailComponent),
                title: 'Détails du Devis'
            },

            // --- 3. COMMANDES (ORDERS) ---
            { 
                path: 'orders', 
                loadComponent: () => import('./orders/order-list/order-list.component').then(m => m.OrderListComponent),
                title: 'Mes Commandes'
            },
            { 
                path: 'orders/create', 
                loadComponent: () => import('./orders/order-create/order-create.component').then(m => m.OrderCreateComponent),
                title: 'Nouvelle Commande'
            },
            { 
                path: 'orders/:id', 
                loadComponent: () => import('./orders/order-details/order-details.component').then(m => m.OrderDetailComponent),
                title: 'Suivi de Commande'
            },

            // --- 4. FAVORIS ---
            { 
                path: 'favorites', 
                loadComponent: () => import('./favorites/favorites.component').then(m => m.FavoritesComponent),
                title: 'Mes Modèles Favoris'
            },

            // --- 5. NOTIFICATIONS ---
            { 
                path: 'notifications', 
                loadComponent: () => import('./notifications/notification-client.component').then(m => m.NotificationClientComponent),
                title: 'Centre de Notifications'
            },

            // --- 6. PROFIL & PARAMÈTRES ---
            { 
                path: 'profile', 
                loadComponent: () => import('./profile/client-user-profile.component').then(m => m.ClientUserProfileComponent),
                title: 'Mon Profil'
            },

            // --- GESTION DES ERREURS ---
            { path: '**', redirectTo: 'dashboard' }
        ]
    }
];