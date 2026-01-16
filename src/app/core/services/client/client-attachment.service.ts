import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UploadResponse } from '../../../core/models/client/quotes/attachment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientAttachmentService {
  /**
   * L'URL de base est récupérée depuis le fichier d'environnement.
   * Typiquement : http://localhost:8000/api/attachments
   */
  private apiUrl = `${environment.apiUrl}/attachments`; 

  private http = inject(HttpClient);

  /**
   * Téléverse un fichier pour un devis (existant ou en cours de création).
   * * @param file Le fichier physique à envoyer.
   * @param quoteId L'ID numérique (soit l'ID réel de la DB, soit le timestamp temporaire).
   * @returns Un Observable contenant la réponse du serveur (notamment l'ID de l'attachement créé).
   */
  uploadFile(file: File, quoteId: number): Observable<UploadResponse> {
    const formData = new FormData();
    
    // Ajout du fichier au FormData
    formData.append('file', file);
    
    /**
     * LOGIQUE DE L'ID TEMPORAIRE :
     * Pour que le backend puisse lier le fichier à un devis qui n'est pas encore 
     * enregistré en base de données, on envoie l'ID sous deux clés :
     * 1. 'quote_id' : Pour la compatibilité standard.
     * 2. 'temp_quote_id' : Pour indiquer au backend que c'est un ID provisoire.
     */
    formData.append('quote_id', quoteId.toString());
    formData.append('temp_quote_id', quoteId.toString());

    return this.http.post<UploadResponse>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprime un fichier joint du serveur.
   * * @param attachmentId L'ID de l'attachement à supprimer en base de données.
   */
  deleteAttachment(attachmentId: number): Observable<void> {
    const url = `${this.apiUrl}/${attachmentId}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion centralisée des erreurs HTTP pour le service d'attachements.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue.';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client ou réseau
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Le backend a renvoyé un code d'erreur (401, 422, 500, etc.)
      console.error(`Code erreur ${error.status}, message: `, error.error);
      errorMessage = error.error?.message || `Erreur serveur (Code: ${error.status})`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}