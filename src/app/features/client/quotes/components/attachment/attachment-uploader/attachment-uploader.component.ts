import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientAttachmentService } from '../../../../../../core/services/client/client-attachment.service';
import { Attachment } from '../../../../../../core/models/client/quotes/attachment.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-attachment-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">
        Fichiers Joints (Optionnel)
      </h3>

      <!-- Zone de Glisser-Déposer -->
      <div 
        (drop)="onFileDrop($event)" 
        (dragover)="onDragOver($event)" 
        (dragleave)="onDragLeave($event)"
        (click)="fileInput.click()"
        [class.border-indigo-500]="isDragging()"
        class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200"
        [ngClass]="{'border-gray-300 bg-gray-50': !isDragging(), 'border-indigo-500 bg-indigo-50': isDragging()}"
      >
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-600 font-medium">Glissez & Déposez ou Cliquez ici</p>
        <p class="text-xs text-gray-500">Formats acceptés : PNG, JPG, JPEG, DXF, AI, PDF, SVG (Max 10Mo)</p>
        <input 
          type="file" 
          #fileInput 
          (change)="onFileInput($event)" 
          class="hidden"
          accept=".png,.jpg,.jpeg,.dxf,.ai,.pdf,.svg"
        >
      </div>

      <!-- Indicateur de Téléversement -->
      @if (isUploading()) {
        <div class="mt-4 p-3 bg-indigo-100 rounded-lg flex items-center justify-between">
          <p class="text-indigo-700 text-sm font-medium">
            Téléversement de {{ fileName() }} en cours...
          </p>
          <div class="w-4 h-4 border-2 border-indigo-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      }

      <!-- Message d'Erreur -->
      @if (uploadError()) {
        <div class="mt-4 p-3 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
          Erreur: {{ uploadError() }}
        </div>
      }

      <!-- Liste des Fichiers Joints Existant -->
      <ul class="mt-4 space-y-2">
        @if (attachments().length > 0) {
          @for (att of attachments(); track att.id) {
            <li class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span class="text-sm font-medium text-gray-700 truncate mr-3">
                {{ att.original_name }}
              </span>
              <div class="flex items-center space-x-2">
                <!-- Lien de téléchargement (Simulé ici, car l'URL directe n'est pas utilisée) -->
                <!-- Note: Dans un environnement réel, le "show" controller renvoie le fichier -->
                <a href="http://localhost:8000/api/attachments/{{att.id}}" target="_blank" class="text-blue-500 hover:text-blue-700 transition" title="Télécharger">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>
                
                <button 
                  (click)="deleteAttachment(att)" 
                  class="text-red-500 hover:text-red-700 transition disabled:opacity-50" 
                  [disabled]="isDeleting(att.id)"
                  title="Supprimer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </li>
          }
        } @else {
          <li class="text-sm text-gray-500 italic p-2">Aucun fichier joint actuellement.</li>
        }
      </ul>
    </div>
  `,
})
export class AttachmentUploaderComponent {
  private attachmentService = inject(ClientAttachmentService);

  // Propriétés du composant (Inputs/Outputs/Signals)
  quoteId = input.required<number>(); // ID du devis DRAFT
  attachments = input.required<Attachment[]>(); // Liste des fichiers déjà attachés
  
  // Output pour notifier le composant parent des changements
  attachmentAdded = output<Attachment>();
  attachmentRemoved = output<number>(); // ID de l'attachment supprimé

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

    // Vérification simple de la taille (le contrôleur API fait la vérification finale)
    if (file.size > 10 * 1024 * 1024) { 
        this.uploadError.set('Le fichier est trop volumineux (max 10 Mo).');
        return;
    }

    this.isUploading.set(true);
    this.fileName.set(file.name);

    this.attachmentService.uploadFile(file, this.quoteId()).pipe(
        catchError(err => {
            console.error('Erreur lors du téléversement:', err);
            // Gérer les erreurs de validation ou serveur
            const errorMsg = err.error?.message || err.error?.errors?.file?.[0] || 'Erreur inconnue lors de l\'upload.';
            this.uploadError.set(errorMsg);
            return of(null);
        }),
        // S'assurer que le statut de chargement est réinitialisé quelle que soit l'issue
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
              // Afficher une erreur ou loguer, mais laisser l'ID dans la liste de suppression pour le moment
              this.uploadError.set('Erreur lors de la suppression. Veuillez réessayer.');
              return of(null);
          }),
          // Retirer l'ID de la liste de suppression, qu'il y ait erreur ou succès
          finalize(() => {
              this.deletingIds.update(ids => ids.filter(id => id !== attachment.id));
          })
      ).subscribe(
          // La suppression est réussie
          () => {
              this.attachmentRemoved.emit(attachment.id);
              this.uploadError.set(null); // Clear any pending error message
          }
      );
  }
}