import { Component, signal, output, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './header.component.html',
  styleUrl: './header.component.css' 
})
export class HeaderComponent {
  private authService = inject(AuthService);

  // Ces noms sont corrects
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  // PROPRIÉTÉ CALCULÉE POUR L'IMAGE DE PROFIL RETIRÉE

  // OUTPUT pour l'ouverture du modal
  onLoginClicked = output<void>();

  navItems = [
    { label: 'Commander', link: '/order' },
    { label: 'Matériaux', link: '/catalog' },
    { label: 'Aide', link: '/help' },
  ];

  triggerLoginModal(): void {
    this.onLoginClicked.emit();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion', err);
      }
    });
  }
}