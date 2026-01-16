import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';

// Services et modèles
import { CarouselService } from '../../../core/services/catalog/carousel.service';
import { Carousel } from '../../../core/models/carousel.model';

@Component({
  selector: 'app-carousel-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private carouselService = inject(CarouselService);

  // --- États (Signals) ---
  slides = signal<Carousel[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  editingSlideId = signal<number | null>(null);
  removingId = signal<number | null>(null);

  // --- Pagination ---
  currentPage = signal(1);
  itemsPerPage = 4;

  paginatedSlides = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.slides().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => {
    const count = this.slides().length;
    return count > 0 ? Math.ceil(count / this.itemsPerPage) : 1;
  });

  // --- Configuration des liens ---
  availableLinks = [
    { label: 'Accueil / Catalogue', url: '/catalog' },
    { label: 'Configurateur 3D', url: '/configurator' },
    { label: 'Panier / Devis', url: '/cart' },
    { label: 'Ouvrir Connexion (Modal)', url: '#login' },
    { label: 'Aperçu Rapide', url: '/preview' }
  ];

  // --- Gestion des fichiers ---
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);

  // --- Formulaire Réactif ---
  carouselForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    subtitle: ['', [Validators.required]],
    category_name: ['Explorer la Collection', [Validators.required]], 
    link_url: ['/catalog', [Validators.required]], 
    order: [1, [Validators.required, Validators.min(1)]], 
    // image_height : min/max conservés, step géré dans le HTML pour la précision
    image_height: [480, [Validators.required, Validators.min(300), Validators.max(1200)]], 
    is_active: [true]
  });

  ngOnInit(): void {
    this.loadSlides();
  }

  loadSlides(): void {
    this.isLoading.set(true);
    this.carouselService.getAdminCarousel() 
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError((err) => {
          console.error('Erreur API:', err);
          return of([]); 
        })
      )
      .subscribe((data: any) => {
        const rawData = Array.isArray(data) ? data : (data?.data || []);
        const sortedData = [...rawData].sort((a, b) => (a.order || 0) - (b.order || 0));
        this.slides.set(sortedData);
      });
  }

  /**
   * PRÉPARE LE FORMULAIRE POUR L'ÉDITION
   * Correction : Synchronisation précise des liens et de la hauteur
   */
  editSlide(slide: Carousel): void {
    this.editingSlideId.set(slide.id);
    
    // Extraction sécurisée des valeurs (gestion des alias backend possible)
    const currentLink = slide.link || slide.link || '/catalog';
    const currentHeight = slide.height || slide.height || 480;

    this.carouselForm.patchValue({
      title: slide.title,
      subtitle: slide.subtitle,
      category_name: slide.category_name,
      link_url: currentLink, 
      order: slide.order,
      image_height: currentHeight,
      is_active: !!slide.is_active
    });

    this.imagePreview.set(slide.full_image_url);
    // Remonte en haut de page pour accéder au formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * ENREGISTRE OU MET À JOUR LA SLIDE
   */
  onSubmit(): void {
    // Validation : Une image est requise seulement pour une nouvelle slide
    if (this.carouselForm.invalid || (!this.selectedFile && !this.editingSlideId())) {
      alert('Veuillez vérifier les champs et l\'image.');
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData();
    const formValues = this.carouselForm.value;
    
    // Mapping FormData pour envoi Multipart
    formData.append('title', formValues.title);
    formData.append('subtitle', formValues.subtitle);
    formData.append('category_name', formValues.category_name);
    formData.append('link_url', formValues.link_url); 
    formData.append('order', formValues.order.toString());
    formData.append('image_height', formValues.image_height.toString());
    formData.append('is_active', formValues.is_active ? '1' : '0');
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Spoofing de méthode PUT pour Laravel avec FormData
    if (this.editingSlideId()) {
      formData.append('_method', 'PUT');
    }

    const request = this.editingSlideId() 
      ? this.carouselService.updateSlide(this.editingSlideId()!, formData) 
      : this.carouselService.createSlide(formData);

    request.pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.loadSlides();
          this.resetForm();
        },
        error: (err) => {
          console.error('Erreur sauvegarde:', err);
          alert('Une erreur est survenue lors de l\'enregistrement.');
        }
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  deleteSlide(id: number): void {
    if (!confirm('Confirmer la suppression de cette bannière ?')) return;
    
    this.removingId.set(id);

    // Petit délai pour laisser l'animation de sortie CSS (optionnel)
    setTimeout(() => {
      this.carouselService.deleteSlide(id).subscribe({
        next: () => {
          this.slides.update(current => current.filter(s => s.id !== id));
          this.removingId.set(null);
          
          if (this.paginatedSlides().length === 0 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          }
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.removingId.set(null);
        }
      });
    }, 300); 
  }

  resetForm(): void {
    this.carouselForm.reset({
      link_url: '/catalog',
      is_active: true,
      order: 1,
      image_height: 480,
      category_name: 'Explorer la Collection'
    });
    this.editingSlideId.set(null);
    this.selectedFile = null;
    this.imagePreview.set(null);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide.');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }
}