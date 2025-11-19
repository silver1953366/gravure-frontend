import { Component, inject, output, signal, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; // Pour le cas où vous ajoutez un champ
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service'; // 🛑 NOUVEL IMPORT

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, FormsModule], 
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  // --- Services et Données ---
  private authService = inject(AuthService);
  private router = inject(Router);
  private layoutService = inject(LayoutService); // 🛑 INJECTION
  
  // Lecture de l'état du service pour l'icône de la Navbar
  isSidebarOpen = this.layoutService.isSidebarOpen;

  // Conservez l'input userName si cette donnée vient du Layout Parent
  @Input() userName: string = ''; 
  
  isLoggedIn = this.authService.isAuthenticated; 
  openLoginModal = output<void>(); 
  cartItemCount = signal(0); 

  // --- Actions ---

  onToggleSidebar(): void {
    this.layoutService.toggleSidebar(); // 🛑 APPEL DU SERVICE
  }

  onLoginClick(): void {
    this.openLoginModal.emit();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        console.error("Erreur lors de la déconnexion.", err);
      }
    });
  }
}