import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Utilisez RouterModule car c'est le standard pour RouterLink dans les standalone
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-footer',
  standalone: true,
  // Remplacer RouterLink par RouterModule pour englober la fonctionnalité
  imports: [CommonModule, RouterModule], 
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'] // Utiliser styleUrls
})
export class FooterComponent {
  // Propriété pour l'année du copyright
  currentYear = new Date().getFullYear();
  
  // Liens pour la colonne "L'entreprise"
  companyLinks = [
    { label: 'À propos de nous', path: '/about' },
    { label: 'Nous contacter', path: '/contact' },
    { label: 'FAQ', path: '/faq' }
  ];

  // Liens pour la colonne "Légal"
  legalLinks = [
    { label: 'Conditions Générales', path: '/terms' },
    { label: 'Politique de Confidentialité', path: '/privacy' },
    { label: 'Mentions Légales', path: '/legal' }
  ];
}