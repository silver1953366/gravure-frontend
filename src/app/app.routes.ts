import { Routes } from '@angular/router';

// Les Guards nécessaires pour protéger les routes
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


//NOTE IMPORTANTE: TOUS les imports de composants Admin/Controller sont supprimés ici.
// Seuls les imports des fichiers de routes sont nécessaires (via loadChildren).

export const routes: Routes = [

 // 1. Domaine CATALOGUE (Public) - CORRIGÉ : Utilise PublicLayoutComponent
 {
 path: '',
 // CHARGE LE LAYOUT PARENT (contient la Navbar et le Footer)
     loadComponent: () => import('./shared/layouts/public-layout/public-layout.component')
         .then(m => m.PublicLayoutComponent),
        children: [
            // Ces routes se chargeront DANS le <router-outlet> du PublicLayoutComponent
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
            // La route par défaut du layout public
            { path: '', redirectTo: 'catalog', pathMatch: 'full' },
           ]
    },

    // 2. Domaine AUTH (Inchangé - souvent plein écran)
      {
        path: 'auth',
        canActivate: [guestGuard],
         children: [
            // ... routes d'authentification ...
         ]
      },


     // 3. Domaine CLIENT (Inchangé)
    // 3. Domaine CLIENT (Mis à jour pour utiliser loadChildren)
    {
        path: 'client',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['client'] },
        // On lie ici le fichier que nous venons de créer
        loadChildren: () => import('./features/client/client.routes').then(r => r.CLIENT_ROUTES)
    },


    // 4. Domaine CONTROLLER (Inchangé)
   {
       path: 'controller',
       canActivate: [authGuard, roleGuard],
        data: { roles: ['controller'] },
     loadChildren: () => import('./features/controller/controller.route').then(r => r.CONTROLLER_ROUTES)
    },


 // 5. Domaine ADMIN (Inchangé)
    {
     path: 'admin',
     canActivate: [authGuard, roleGuard],
     data: { roles: ['admin'] },
     loadChildren: () => import('./features/admin/admin.route').then(r => r.ADMIN_ROUTES)
    },

     // 6. Page 404
    { path: '**', component: NotFoundComponent },
];