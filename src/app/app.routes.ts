// src/app/app.routes.ts

import { Routes } from '@angular/router';

// Les Guards nécessaires pour protéger les routes
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


// 🛑 NOTE IMPORTANTE: TOUS les imports de composants Admin/Controller sont supprimés ici.
// Seuls les imports des fichiers de routes sont nécessaires (via loadChildren).

export const routes: Routes = [

    // 1. Domaine CATALOGUE (Public) - NON MODIFIÉ
    {
        path: '',
        children: [
            {
                path: 'catalog',
                loadComponent: () => import('./catalog/pages/catalog-list/catalog-list.component').then(m => m.CatalogListComponent)
            },
            {
                path: 'configurator',
                loadComponent: () => import('./catalog/pages/configurator/configurator.component')
                                     .then(m => m.ConfiguratorComponent)
            },
            {
                path: 'configurator/:materialId', 
                loadComponent: () => import('./catalog/pages/configurator/configurator.component')
                                     .then(m => m.ConfiguratorComponent)
            },
            {
                path: 'preview',
                loadComponent: () => import('./catalog/pages/preview/preview.component').then(m => m.PreviewComponent)
            },
            { path: '', redirectTo: 'catalog', pathMatch: 'full' },
        ]
    },

    // 2. Domaine AUTH (Public - Protégé par guestGuard) - NON MODIFIÉ
    {
        path: 'auth',
        canActivate: [guestGuard],
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/auth/auth.component').then(m => m.AuthComponent),
                title: 'Connexion'
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/auth/auth.component').then(m => m.AuthComponent),
                title: 'Inscription'
            },
            {
                path: 'forgot-password',
                loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            },
        ]
    },


    // 3. Domaine CLIENT (Protégé - Rôle: Client) - NON MODIFIÉ
    {
        path: 'client',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['client'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/client/dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
            },
            // Routes pour les Devis (Quotes)
            {
                path: 'quotes',
                loadComponent: () => import('./features/client/quotes/quote-list/quote-list.component')
                  .then(m => m.QuoteListComponent),
            },
            {
                path: 'quotes/:id',
                loadComponent: () => import('./features/client/quotes/quote-detail/quote-detail.component')
                  .then(m => m.QuoteDetailComponent),
            },
            
            // Routes pour les Commandes (Orders)
            {
                path: 'orders',
                loadComponent: () => import('./features/client/orders/order-list/order-list.component').then(m => m.OrderListComponent)
            },
            {
                path: 'orders/:id',
                loadComponent: () => import('./features/client/orders/order-details/order-details.component').then(m => m.OrderDetailComponent)
            },
            {
                path: 'order-create/:quoteId', 
                loadComponent: () => import('./features/client/orders/order-create/order-create.component').then(m => m.OrderCreateComponent)
            },

            {
                path: 'favorites',
                loadComponent: () => import('./features/client/favorites/favorites.component').then(m => m.FavoritesComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/client/profile/user-profile/client-user-profile/client-user-profile.component').then(m => m.ClientUserProfileComponent)
            },
        ]
    },


    // 4. Domaine CONTROLLER (Protégé - Rôle: Controller)
    {
        path: 'controller',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['controller'] },
        // 🛑 NOUVEAU : Chargement Paresseux des routes du Contrôleur (avec Layout)
        loadChildren: () => import('./features/controller/controller.route').then(r => r.CONTROLLER_ROUTES)
    },


    // 5. Domaine ADMIN (Protégé - Rôle: Admin)
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
        // 🛑 NOUVEAU : Chargement Paresseux des routes Admin (avec Layout)
        loadChildren: () => import('./features/admin/admin.route').then(r => r.ADMIN_ROUTES)
    },

    // 6. Page 404 (Doit être la dernière route)
    { path: '**', component: NotFoundComponent },
];