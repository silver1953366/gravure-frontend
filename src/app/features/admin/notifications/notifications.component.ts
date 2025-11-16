import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { take } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  
  allNotifications: Notification[] = [];
  isLoadingNotifications = true;
  errorNotifications: string | null = null;
  
  notificationForm: FormGroup;
  isSending = false;
  apiErrors: any = {};
  sendSuccessMessage: string | null = null;
  
  notificationTypes = ['info', 'warning', 'success', 'error'];

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.notificationForm = this.fb.group({
      user_ids: ['', [Validators.required, Validators.pattern(/^(\s*\d+\s*,\s*)*\s*\d+\s*$/)]], 
      type: ['info', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      link: [''],
    });
  }

  ngOnInit(): void {
    this.fetchSystemNotifications();
  }

  fetchSystemNotifications(): void {
    this.isLoadingNotifications = true;
    this.errorNotifications = null;
    this.notificationService.getAllSystemNotifications().subscribe({
      next: (data) => {
        this.allNotifications = data;
        this.isLoadingNotifications = false;
      },
      error: (err: any) => { // Correction TS7006
        console.error("Erreur de chargement des notifications:", err);
        this.errorNotifications = "Impossible de charger les notifications système.";
        this.isLoadingNotifications = false;
      }
    });
  }

  onSendNotification(): void {
    this.sendSuccessMessage = null;
    this.apiErrors = {};

    if (this.notificationForm.invalid) {
      this.notificationForm.markAllAsTouched();
      return;
    }

    this.isSending = true;
    const formValue = this.notificationForm.value;
    
    const userIdsArray = formValue.user_ids.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));

    const payload = {
      user_id: userIdsArray,
      type: formValue.type,
      title: formValue.title,
      message: formValue.message,
      link: formValue.link || null
    };

    this.notificationService.sendNotification(payload).pipe(take(1)).subscribe({
      next: (res) => {
        this.isSending = false;
        this.sendSuccessMessage = res.message || "Notification(s) envoyée(s) avec succès.";
        this.notificationForm.reset({ type: 'info' });
        this.fetchSystemNotifications();
      },
      error: (err: any) => { // Correction TS7006
        this.isSending = false;
        if (err.status === 422 && err.error.errors) {
            this.apiErrors = err.error.errors;
            if (this.apiErrors['user_id.0']) {
                this.apiErrors['user_id'] = this.apiErrors['user_id.0'];
                delete this.apiErrors['user_id.0'];
            }
        } else {
            this.apiErrors = { general: "Une erreur inattendue est survenue lors de l'envoi." };
        }
        console.error("Erreur API lors de l'envoi:", err);
      }
    });
  }

  onDeleteNotification(id: number): void {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette notification du système?")) {
          this.notificationService.deleteNotification(id).subscribe({
              next: () => {
                  this.allNotifications = this.allNotifications.filter(n => n.id !== id);
              },
              error: (err: any) => { // Correction TS7006
                  alert("Erreur lors de la suppression de la notification.");
                  console.error(err);
              }
          });
      }
  }
}