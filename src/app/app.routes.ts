import { Routes } from '@angular/router';

// =====================================================
// 🛡️ Guards (Les chemins d'importation sont supposés corrects)
// =====================================================
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';


// =====================================================
// 🔐 Authentification & Pages Publiques
// =====================================================
import { AuthComponent } from './features/auth/auth/auth.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


export const routes: Routes = [

  // =====================================================
  // 🏠 ROUTE RACINE : Redirige vers la Connexion
  // =====================================================
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 


  // =====================================================
  // 🟢 ROUTES PUBLIQUES (Catalogue & Authentification)
  // =====================================================
  {
    path: 'catalog', 
    loadComponent: () => import('./catalog/pages/catalog-list/catalog-list.component').then(m => m.CatalogListComponent), 
    title: 'Catalogue' 
  },
  {
    path: 'configurator', 
    loadComponent: () => import('./catalog/pages/configurator/configurator.component').then(m => m.ConfiguratorComponent), 
    title: 'Personnalisation' 
  },
  {
    path: 'preview', 
    loadComponent: () => import('./catalog/pages/preview/preview.component').then(m => m.PreviewComponent), 
    title: 'Prévisualisation' 
  },
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [guestGuard],
    title: 'Connexion | Plaques Gravées'
  },
  {
    path: 'register',
    component: AuthComponent,
    canActivate: [guestGuard],
    title: 'Inscription | Plaques Gravées'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
    title: 'Mot de passe oublié'
  },


  // =====================================================
  // 🟣 ADMIN (Protégé)
  // =====================================================
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent), title: 'Tableau de bord' },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent), title: 'Gestion des utilisateurs' },
      { path: 'materials', loadComponent: () => import('./features/admin/materials/materials.component').then(m => m.MaterialsComponent), title: 'Matériaux' },
      { path: 'shapes', loadComponent: () => import('./features/admin/shapes/shapes.component').then(m => m.ShapesComponent), title: 'Formes' },
      { path: 'categories', loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent), title: 'Catégories' },
      { path: 'pricing', loadComponent: () => import('./features/admin/pricing/pricing.component').then(m => m.PricingComponent), title: 'Catalogue de prix' },
      { path: 'notifications', loadComponent: () => import('./features/admin/notifications/notifications.component').then(m => m.NotificationsComponent), title: 'Notifications' },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent), title: 'Rapports & Analyses' },
    ]
  },

  // =====================================================
  // 🔵 CONTROLLER (Protégé)
  // =====================================================
  {
    path: 'controller',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['controller'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/controller/dashboard/dashboard.component').then(m => m.DashboardComponent), title: 'Tableau de bord' },
      { path: 'quotes', loadComponent: () => import('./features/controller/quotes/quotes.component').then(m => m.QuotesComponent), title: 'Devis' },
      { path: 'orders', loadComponent: () => import('./features/controller/orders/orders.component').then(m => m.OrdersComponent), title: 'Commandes' },
      { path: 'clients', loadComponent: () => import('./features/controller/clients/clients.component').then(m => m.ClientsComponent), title: 'Clients' },
      { path: 'notifications', loadComponent: () => import('./features/controller/notifications/notifications.component').then(m => m.NotificationsComponent), title: 'Notifications' },
    ]
  },

  // =====================================================
  // 🟠 CLIENT (Espace Personnel Protégé)
  // =====================================================
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['client'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // Le dashboard est la page d'accueil de l'espace client
      { path: 'dashboard', loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.DashboardComponent), title: 'Tableau de bord client' },

      // Routes d'espace personnel
      { path: 'quotes', loadComponent: () => import('./features/client/quotes/quotes.component').then(m => m.QuotesComponent), title: 'Demande de devis' },
      { path: 'orders', loadComponent: () => import('./features/client/orders/orders.component').then(m => m.OrdersComponent), title: 'Commandes' },
      { path: 'favorites', loadComponent: () => import('./features/client/favorites/favorites.component').then(m => m.FavoritesComponent), title: 'Favoris' },
      { path: 'profile', loadComponent: () => import('./features/client/profile/profile.component').then(m => m.ProfileComponent), title: 'Profil' },
    ]
  },

  // =====================================================
  // 🚫 PAGE 404
  // =====================================================
  { path: '**', component: NotFoundComponent, title: 'Page introuvable' }
];