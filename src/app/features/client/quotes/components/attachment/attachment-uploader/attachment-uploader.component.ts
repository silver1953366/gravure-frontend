// src/app/features/client/quotes/components/attachment/attachment-uploader/attachment-uploader.component.ts

import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientAttachmentService } from '../../../../../../core/services/client/client-attachment.service';
import { Attachment } from '../../../../../../core/models/client/quotes/attachment.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-attachment-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-uploader.component.html', // Pointage vers le fichier HTML
  styleUrls: ['./attachment-uploader.component.css'] // Pointage vers le fichier CSS
})
export class AttachmentUploaderComponent {
  private attachmentService = inject(ClientAttachmentService);

  // Propriétés du composant (Inputs/Outputs/Signals)
  quoteId = input.required<number>(); 
  attachments = input.required<Attachment[]>(); 
  
  // Output pour notifier le composant parent des changements
  attachmentAdded = output<Attachment>();
  attachmentRemoved = output<number>(); 

  isDragging = signal(false);
  isUploading = signal(false);
  fileName = signal('');
  uploadError = signal<string | null>(null);
  
  // Suivi des suppressions en cours pour désactiver le bouton
  deletingIds = signal<number[]>([]);

  // ------------------ Logique Glisser-Déposer ------------------

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.upload(file);
    }
  }

  // ------------------ Logique Clic sur Input ------------------

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.upload(file);
    }
    // Réinitialiser l'input pour pouvoir uploader le même fichier si l'utilisateur le souhaite
    input.value = ''; 
  }

  // ------------------ Logique Upload ------------------

  private upload(file: File): void {
    this.uploadError.set(null);

    if (file.size > 10 * 1024 * 1024) { 
        this.uploadError.set('Le fichier est trop volumineux (max 10 Mo).');
        return;
    }

    this.isUploading.set(true);
    this.fileName.set(file.name);

    this.attachmentService.uploadFile(file, this.quoteId()).pipe(
        catchError(err => {
            console.error('Erreur lors du téléversement:', err);
            const errorMsg = err.error?.message || err.error?.errors?.file?.[0] || 'Erreur inconnue lors de l\'upload.';
            this.uploadError.set(errorMsg);
            return of(null);
        }),
        finalize(() => {
            this.isUploading.set(false);
            this.fileName.set('');
        })
    ).subscribe(response => {
        if (response && response.attachment) {
            this.attachmentAdded.emit(response.attachment);
        }
    });
  }
  
  // ------------------ Logique Suppression ------------------

  isDeleting(id: number): boolean {
      return this.deletingIds().includes(id);
  }

  deleteAttachment(attachment: Attachment): void {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${attachment.original_name}" ?`)) {
          return;
      }
      
      this.deletingIds.update(ids => [...ids, attachment.id]);

      this.attachmentService.deleteAttachment(attachment.id).pipe(
          catchError(err => {
              console.error('Erreur lors de la suppression du fichier:', err);
              this.uploadError.set('Erreur lors de la suppression. Veuillez réessayer.');
              return of(null);
          }),
          finalize(() => {
              this.deletingIds.update(ids => ids.filter(id => id !== attachment.id));
          })
      ).subscribe(
          () => {
              this.attachmentRemoved.emit(attachment.id);
              this.uploadError.set(null); 
          }
      );
  }
}