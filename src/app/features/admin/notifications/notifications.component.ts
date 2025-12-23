import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  // --- Signaux d'état (Réactivité Angular 18+) ---
  allNotifications = signal<Notification[]>([]); // Historique
  usersList = signal<any[]>([]);                 // Tous les clients chargés depuis l'API
  selectedUsers = signal<any[]>([]);             // Clients sélectionnés pour l'envoi
  
  isLoadingNotifications = signal(true);
  isSending = signal(false);
  
  // Gestion des messages et erreurs
  errorNotifications = signal<string | null>(null);
  sendSuccessMessage = signal<string | null>(null);
  apiErrors = signal<any>({});

  notificationForm: FormGroup;
  notificationTypes = ['info', 'warning', 'success', 'error'];

  constructor() {
    this.notificationForm = this.fb.group({
      // Champ technique pour la validation du bouton envoyer
      user_ids: [null, [Validators.required]], 
      type: ['info', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(5)]],
      link: [''],
    });
  }

  ngOnInit(): void {
    this.refreshHistory();
    this.loadAllClients();
  }

  /**
   * Charge la liste de tous les clients pour le menu déroulant
   */
  loadAllClients(): void {
    this.notificationService.getUsersList().subscribe({
      next: (users) => this.usersList.set(users),
      error: (err) => console.error("Erreur lors du chargement des clients", err)
    });
  }

  /**
   * Gère la sélection dans le menu déroulant (Un seul, plusieurs ou TOUS)
   */
  onUserSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    if (!value) return;

    if (value === 'all') {
      // CAS : Envoyer à tout le monde
      this.selectedUsers.set([...this.usersList()]);
    } else {
      // CAS : Sélection individuelle
      const userId = parseInt(value, 10);
      const user = this.usersList().find(u => u.id === userId);
      
      // On l'ajoute seulement s'il n'est pas déjà dans la liste des sélectionnés
      if (user && !this.selectedUsers().find(u => u.id === userId)) {
        this.selectedUsers.update(prev => [...prev, user]);
      }
    }

    this.syncFormValidation();
    selectElement.value = ""; // Réinitialise le select pour le prochain choix
  }

  /**
   * Retire un client spécifique de la liste d'envoi
   */
  removeUser(userId: number): void {
    this.selectedUsers.update(users => users.filter(u => u.id !== userId));
    this.syncFormValidation();
  }

  /**
   * Vide totalement la liste des destinataires
   */
  clearAllSelected(): void {
    this.selectedUsers.set([]);
    this.syncFormValidation();
  }

  /**
   * SYNCHRONISATION : Met à jour le formulaire pour activer/désactiver le bouton Envoyer
   */
  private syncFormValidation(): void {
    const count = this.selectedUsers().length;
    
    if (count > 0) {
      // On donne une valeur au champ user_ids pour valider le formulaire
      this.notificationForm.get('user_ids')?.setValue(this.selectedUsers().map(u => u.id).join(','));
    } else {
      this.notificationForm.get('user_ids')?.setValue(null);
    }
    
    this.notificationForm.get('user_ids')?.markAsDirty();
    this.notificationForm.get('user_ids')?.updateValueAndValidity();
  }

  /**
   * Récupère l'historique des notifications
   */
  refreshHistory(): void {
    this.isLoadingNotifications.set(true);
    this.notificationService.getAllSystemNotifications().subscribe({
      next: (data) => {
        this.allNotifications.set(data);
        this.isLoadingNotifications.set(false);
      },
      error: () => {
        this.errorNotifications.set("Impossible de charger l'historique.");
        this.isLoadingNotifications.set(false);
      }
    });
  }

  /**
   * ENVOI : Prépare et expédie la notification
   */
  onSendNotification(): void {
    if (this.notificationForm.invalid || this.selectedUsers().length === 0) {
      this.notificationForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.sendSuccessMessage.set(null);
    this.apiErrors.set({});

    // On transforme les objets utilisateurs en tableau d'IDs simple
    const payload = {
      user_id: this.selectedUsers().map(u => u.id),
      type: this.notificationForm.value.type,
      title: this.notificationForm.value.title,
      message: this.notificationForm.value.message,
      link: this.notificationForm.value.link || null
    };

    this.notificationService.sendNotification(payload).pipe(take(1)).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.sendSuccessMessage.set(`Succès : Message envoyé à ${payload.user_id.length} client(s).`);
        
        // Reset de l'interface
        this.selectedUsers.set([]);
        this.notificationForm.reset({ type: 'info', user_ids: null });
        this.refreshHistory();
      },
      error: (err) => {
        this.isSending.set(false);
        if (err.status === 422) {
          this.apiErrors.set(err.error.errors);
        } else {
          this.apiErrors.set({ general: "Une erreur est survenue lors de l'envoi au serveur." });
        }
      }
    });
  }

  /**
   * Suppression d'une notification
   */
  onDeleteNotification(id: number): void {
    if (!confirm("Voulez-vous vraiment supprimer cette notification de l'historique ?")) return;
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.allNotifications.update(notifs => notifs.filter(n => n.id !== id));
      },
      error: (err) => alert("Erreur lors de la suppression.")
    });
  }
}