import { Routes } from '@angular/router';

/**
 * Définition de toutes les routes de l'interface d'administration (Lazy Loading).
 */
export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./shared/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            
            // --- 1. Tableau de Bord ---
            { 
                path: 'dashboard', 
                loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            
            // --- 2. MODULES DEVIS (QUOTES) ---
            { 
                path: 'quotes', 
                loadComponent: () => import('./quotes/admin-quotes.component').then(m => m.AdminQuotesComponent) 
            }, 
            { 
                path: 'quotes/:id', 
                loadComponent: () => import('./quotes/admin-quote-detail/admin-quote-detail.component').then(m => m.AdminQuoteDetailComponent) 
            }, 
            
            // --- 3. MODULES COMMANDES (ORDERS) ---
            { 
                path: 'orders', 
                loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent) 
            }, 
            { 
                path: 'orders/:id', 
                loadComponent: () => import('./orders/admin-order-detail/admin-order-detail.component').then(m => m.AdminOrderDetailComponent) 
            }, 

            // --- 4. MODULE UTILISATEURS ---
            { 
                path: 'users', 
                loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent) 
            },
            { 
                path: 'users/create', 
                loadComponent: () => import('./users/user-form/user-form.component').then(m => m.UserFormComponent) 
            },
            { 
                path: 'users/edit/:id', 
                loadComponent: () => import('./users/user-form/user-form.component').then(m => m.UserFormComponent) 
            },
            
            // --- 5. MODULE INVENTAIRE ---
            { 
                path: 'inventory', 
                loadComponent: () => import('./inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent) 
            },
            { 
                path: 'inventory/create', 
                loadComponent: () => import('./inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent) 
            },
            { 
                path: 'inventory/edit/:id', 
                loadComponent: () => import('./inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent) 
            },

            // --- 6. MODULE CATALOGUE: Matériaux ---
            { 
                path: 'materials', 
                loadComponent: () => import('./materials/material-list/material-list.component').then(m => m.MaterialListComponent) 
            },
            { 
                path: 'materials/create', 
                loadComponent: () => import('./materials/material-form/material-form.component').then(m => m.MaterialFormComponent) 
            },
            { 
                path: 'materials/edit/:id', 
                loadComponent: () => import('./materials/material-form/material-form.component').then(m => m.MaterialFormComponent) 
            },
            
            // --- 7. MODULE CATALOGUE: Catégories ---
            { 
                path: 'categories', 
                loadComponent: () => import('./categories/category-list/category-list.component').then(m => m.CategoryListComponent) 
            },
            { 
                path: 'categories/create', 
                loadComponent: () => import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent) 
            },
            { 
                path: 'categories/edit/:id', 
                loadComponent: () => import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent) 
            },
            
            // --- 8. MODULE CATALOGUE: Formes ---
            { 
                path: 'shapes', 
                loadComponent: () => import('./shapes/shape-list/shape-list.component').then(m => m.ShapeListComponent) 
            },
            { 
                path: 'shapes/create', 
                loadComponent: () => import('./shapes/shape-form/shape-form.component').then(m => m.ShapeFormComponent) 
            },
            { 
                path: 'shapes/edit/:id', 
                loadComponent: () => import('./shapes/shape-form/shape-form.component').then(m => m.ShapeFormComponent) 
            },

            // --- 9. MODULES DE GESTION (Tarification/Règles) ---
            { 
                path: 'pricing', 
                loadComponent: () => import('./pricing/pricing.component').then(m => m.PricingComponent) 
            },
            { 
                path: 'discounts', 
                loadComponent: () => import('./discounts/discounts.component').then(m => m.DiscountsComponent) 
            }, 

            // --- 10. MODULES SYSTÈME & RAPPORTS ---
            { 
                path: 'activity-log', 
                loadComponent: () => import('./activity-log/activity-log.component').then(m => m.ActivityLogComponent) 
            },
            { 
                path: 'reports', 
                loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) 
            },
            { 
                path: 'notifications', 
                loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent) 
            },

            // --- 11. NOUVEAU : MODULE CARROUSEL ---
            { 
                path: 'carousel', 
                loadComponent: () => import('./carousel/carousel.component').then(m => m.CarouselComponent) 
            },
            
            { path: '**', redirectTo: 'dashboard' } 
        ]
    }
];