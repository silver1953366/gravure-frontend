import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientAttachmentService } from '../../../../../../core/services/client/client-attachment.service';
import { Attachment } from '../../../../../../core/models/client/quotes/attachment.model';
import { catchError, finalize, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-attachment-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-uploader.component.html',
  styleUrls: ['./attachment-uploader.component.css']
})
export class AttachmentUploaderComponent {
  private attachmentService = inject(ClientAttachmentService);

  // Inputs via Signals (Angular 17.1+)
  quoteId = input.required<number>(); 
  attachments = input.required<Attachment[]>(); 
  
  // Outputs
  attachmentAdded = output<Attachment>();
  attachmentRemoved = output<number>(); 

  // États locaux
  isDragging = signal(false);
  isUploading = signal(false);
  fileName = signal('');
  uploadError = signal<string | null>(null);
  deletingIds = signal<number[]>([]);

  // --- Gestion du Drag & Drop ---

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.upload(file);
  }

  // --- Gestion de la sélection par clic ---

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
    input.value = ''; // Reset pour permettre de re-sélectionner le même fichier
  }

  // --- Logique d'Upload ---

  private upload(file: File): void {
    this.uploadError.set(null);

    // Validation côté client (Taille)
    if (file.size > 10 * 1024 * 1024) { 
        this.uploadError.set('Le fichier est trop volumineux (max 10 Mo).');
        return;
    }

    this.isUploading.set(true);
    this.fileName.set(file.name);

    // L'ID envoyé ici est le Date.now() du parent (temp_quote_id)
    this.attachmentService.uploadFile(file, this.quoteId()).pipe(
        catchError((err: HttpErrorResponse) => {
            console.error('Détails erreur upload:', err);
            
            let message = 'Erreur lors du téléversement.';
            
            if (err.status === 401) {
                message = 'Session expirée. Veuillez vous reconnecter.';
            } else if (err.status === 422) {
                // Erreurs de validation Laravel (format de fichier non supporté, etc.)
                message = err.error?.errors?.file?.[0] || err.error?.message || 'Format de fichier non valide.';
            } else if (err.status === 0) {
                message = 'Impossible de contacter le serveur (problème réseau ou CORS).';
            }

            this.uploadError.set(message);
            return of(null);
        }),
        finalize(() => {
            this.isUploading.set(false);
            this.fileName.set('');
        })
    ).subscribe(response => {
        if (response && response.attachment) {
            this.attachmentAdded.emit(response.attachment);
            this.uploadError.set(null); // Clear error on success
        }
    });
  }
  
  // --- Logique de Suppression ---

  isDeleting(id: number): boolean {
      return this.deletingIds().includes(id);
  }

  deleteAttachment(attachment: Attachment): void {
      if (!confirm(`Supprimer le fichier "${attachment.original_name}" ?`)) return;
      
      this.deletingIds.update(ids => [...ids, attachment.id]);

      this.attachmentService.deleteAttachment(attachment.id).pipe(
          catchError(err => {
              console.error('Erreur suppression:', err);
              this.uploadError.set('Impossible de supprimer le fichier.');
              return of(null);
          }),
          finalize(() => {
              this.deletingIds.update(ids => ids.filter(id => id !== attachment.id));
          })
      ).subscribe(res => {
          if (res !== null) {
              this.attachmentRemoved.emit(attachment.id);
              this.uploadError.set(null); 
          }
      });
  }
}