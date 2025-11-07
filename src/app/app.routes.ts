import { Routes } from '@angular/router';

// =====================================================
// 🛡️ Guards (Les chemins d'importation sont supposés corrects)
// =====================================================
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestGuard } from './core/guards/guest.guard';


// =====================================================
// 🔐 Authentification & Pages Publiques
// =====================================================
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


export const routes: Routes = [

  // =====================================================
  // 🏠 ROUTE RACINE : Redirige vers le Catalogue Public
  // =====================================================
  { path: '', redirectTo: 'catalog', pathMatch: 'full' }, 


  // =====================================================
  // 🟢 ROUTES PUBLIQUES (Pas de Guard)
  // =====================================================
  {
    // Le catalogue est maintenant accessible sans préfixe '/client'
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
    component: LoginComponent,
    canActivate: [GuestGuard],
    title: 'Connexion | Plaques Gravées'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard],
    title: 'Inscription | Plaques Gravées'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [GuestGuard],
    title: 'Mot de passe oublié'
  },


  // =====================================================
  // 🟣 ADMIN (Protégé)
  // =====================================================
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent), title: 'Tableau de bord' },
      // ... autres routes admin
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
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['controller'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // ... routes controller
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
    canActivate: [AuthGuard, RoleGuard],
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