// src/app/features/admin/admin.routes.ts

import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/admin-layout.component';

// --- IMPORTS DES COMPOSANTS ADMIN EXISTANTS ---
// Module Utilisateurs
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormComponent } from './users/user-form/user-form.component';

// Module Inventaire
import { InventoryListComponent } from './inventory/inventory-list/inventory-list.component';
import { InventoryFormComponent } from './inventory/inventory-form/inventory-form.component';

// Modules Catalogue (CRUD)
import { MaterialListComponent } from './materials/material-list/material-list.component';
import { MaterialFormComponent } from './materials/material-form/material-form.component';
import { CategoryListComponent } from './categories/category-list/category-list.component';
import { CategoryFormComponent } from './categories/category-form/category-form.component';
import { ShapeListComponent } from './shapes/shape-list/shape-list.component';
import { ShapeFormComponent } from './shapes/shape-form/shape-form.component';

// Modules Métier & Système
import { PricingComponent } from './pricing/pricing.component';
import { ReportsComponent } from './reports/reports.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ActivityLogComponent } from './activity-log/activity-log/activity-log.component';
import { DiscountsComponent } from './discounts/discounts.component'; 
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';

// 🛑 IMPORTS DES NOUVEAUX MODULES DE TRANSACTION (Devis & Commandes)
import { AdminQuotesComponent } from './quotes/admin-quotes.component'; 
import { AdminOrdersComponent } from './orders/admin-orders.component'; 
import { AdminOrderDetailComponent } from './orders/admin-order-detail/admin-order-detail.component'; 


export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        // J'utilise votre syntaxe 'loadComponent' pour AdminLayoutComponent
        loadComponent: () => import('./shared/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            {
                path: 'dashboard',
                component: AdminDashboardComponent
            },
            
            // 🛑 MODULES DEVIS (QUOTES)
            { path: 'quotes', component: AdminQuotesComponent },
            // Ajout potentiel pour le détail du devis :
            // { path: 'quotes/:id', component: AdminQuoteDetailComponent }, 
            
            // 🛑 MODULES COMMANDES (ORDERS)
            { path: 'orders', component: AdminOrdersComponent }, // Liste des commandes
            { path: 'orders/:id', component: AdminOrderDetailComponent }, // Détail de la commande

            // --- MODULE UTILISATEURS (Admin SEUL) ---
            { path: 'users', component: UserListComponent },
            { path: 'users/create', component: UserFormComponent },
            { path: 'users/edit/:id', component: UserFormComponent },
            
            // --- MODULE INVENTAIRE (Lecture/Ecriture Admin) ---
            { path: 'inventory', component: InventoryListComponent },
            { path: 'inventory/create', component: InventoryFormComponent },
            { path: 'inventory/edit/:id', component: InventoryFormComponent },

            // --- MODULE CATALOGUE & PRIX (CRUD Admin) ---
            { path: 'materials', component: MaterialListComponent },
            { path: 'materials/create', component: MaterialFormComponent },
            { path: 'materials/edit/:id', component: MaterialFormComponent },
            
            { path: 'categories', component: CategoryListComponent },
            { path: 'categories/create', component: CategoryFormComponent },
            { path: 'categories/edit/:id', component: CategoryFormComponent },
            
            { path: 'shapes', component: ShapeListComponent },
            { path: 'shapes/create', component: ShapeFormComponent },
            { path: 'shapes/edit/:id', component: ShapeFormComponent },

            { path: 'pricing', component: PricingComponent },
            { path: 'discounts', component: DiscountsComponent }, 

            // --- MODULES SYSTÈME & RAPPORTS ---
            { path: 'activity-log', component: ActivityLogComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'notifications', component: NotificationsComponent },

            // Route par défaut
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];