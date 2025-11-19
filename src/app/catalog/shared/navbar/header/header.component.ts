import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; // Import Router
import { AuthService } from '../../../../core/services/auth.service';

// Interface pour simuler les éléments de navigation (navItems)
interface NavItem {
  label: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css' 
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router); // Inject Router directement pour la navigation

  onLoginClicked = output<void>(); 

  // Propriétés du Service (Signals)
  isAuthenticated = this.authService.isAuthenticated; 
  currentUser = this.authService.currentUser;
  
  // SIGNALS POUR GÉRER LES MENUS DÉROULANTS (Résout les erreurs NG9)
  isLanguageMenuOpen = signal(false);
  isTypeMenuOpen = signal(false);
  isCategoryMenuOpen = signal(false);
  
  // ÉLÉMENTS DE NAVIGATION (Résout l'erreur 'navItems')
  navItems: NavItem[] = [
    { label: 'Accueil', link: '/' },
    { label: 'À Propos', link: '/about' },
    { label: 'Catalogue', link: '/catalog/products' },
    { label: 'Contact', link: '/contact' },
    // Ajoutez d'autres items selon votre besoin
  ];

  // MÉTHODES POUR GÉRER L'OUVERTURE/FERMETURE DES MENUS (Résout les erreurs NG9)
  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update(value => !value);
    this.isTypeMenuOpen.set(false);
    this.isCategoryMenuOpen.set(false);
  }

  toggleTypeMenu(): void {
    this.isTypeMenuOpen.update(value => !value);
    this.isLanguageMenuOpen.set(false);
    this.isCategoryMenuOpen.set(false);
  }

  toggleCategoryMenu(): void {
    this.isCategoryMenuOpen.update(value => !value);
    this.isLanguageMenuOpen.set(false);
    this.isTypeMenuOpen.set(false);
  }
  
  triggerLoginModal(): void {
    this.onLoginClicked.emit();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // CORRECTION TS2341: Utiliser le router injecté dans ce composant
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("Échec de la déconnexion", err);
        // Utiliser le router injecté ici
        this.router.navigate(['/']);
      }
    });
  }
}