import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attachment, UploadResponse } from '../../../core/models/client/quotes/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class ClientAttachmentService {
  private apiUrl = 'http://localhost:8000/api/attachments'; 

  private http = inject(HttpClient);

  /**
   * Téléverse un fichier pour un devis donné.
   * La méthode utilise FormData pour gérer l'envoi de fichiers.
   * POST /api/attachments
   * @param file Le fichier à téléverser.
   * @param quoteId L'ID du devis auquel le fichier est rattaché.
   */
  uploadFile(file: File, quoteId: number): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // Note: Le nom 'quote_id' doit correspondre à ce que le contrôleur Laravel attend
    formData.append('quote_id', quoteId.toString());

    return this.http.post<UploadResponse>(this.apiUrl, formData);
  }

  /**
   * Supprime un fichier joint par son ID.
   * DELETE /api/attachments/{id}
   * @param attachmentId L'ID de l'objet Attachment à supprimer.
   */
  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${attachmentId}`);
  }
}