import { Component, OnInit, OnDestroy, signal, inject, computed, ElementRef, ViewChild, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { forkJoin, finalize, catchError, of } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

// Services
import { CatalogService } from '../../../core/services/catalog/catalog.service';
import { CarouselService } from '../../../core/services/catalog/carousel.service';

// Modèles
import { Category } from '../../../core/models/category.model';
import { Material } from '../../../core/models/material.model';
import { Carousel } from '../../../core/models/carousel.model';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog-list.component.html', 
  styleUrl: './catalog-list.component.css',
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger('60ms', animate('600ms cubic-bezier(0.2, 1, 0.3, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class CatalogListComponent implements OnInit, OnDestroy {
  // --- Injections ---
  private catalogService = inject(CatalogService); 
  private carouselService = inject(CarouselService);
  
  @ViewChild('materialGrid') materialGrid!: ElementRef;

  // --- Outputs ---
  // Émet un événement vers le Layout parent pour ouvrir le modal de login
  openLoginModalEvent = output<void>();

  // --- États (Signals) ---
  categories = signal<Category[]>([]);
  allMaterials = signal<Material[]>([]); 
  carouselData = signal<Carousel[]>([]);
  selectedCategory = signal<Category | null>(null);
  isLoading = signal(true);

  // --- Gestion du Carrousel ---
  currentSlideIndex = signal<number>(0);
  private autoScrollTimer: any;
  private readonly SCROLL_INTERVAL = 6500;

  /**
   * CALCUL DU STYLE DU CARROUSEL
   * Gère la translation horizontale et la hauteur dynamique définie en Admin
   */
  carouselStyle = computed(() => {
    const slides = this.carouselData();
    const currentIndex = this.currentSlideIndex();
    const totalSlides = slides.length;

    if (totalSlides === 0) return { height: '480px' };

    const activeSlide = slides[currentIndex];
    // On vérifie image_height ou height selon ce que l'API renvoie
    const dynamicHeight = activeSlide?.height || activeSlide?.height || 480;

    const width = totalSlides * 100;
    const xOffset = -(currentIndex * (100 / totalSlides));
    
    return {
      'width': `${width}%`,
      'transform': `translateX(${xOffset}%)`,
      'display': 'flex',
      'height': `${dynamicHeight}px`,
      'transition': 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1), height 0.6s ease-in-out'
    };
  });

  /**
   * FILTRAGE RÉACTIF DES MATÉRIAUX
   */
  filteredMaterials = computed(() => {
    const selected = this.selectedCategory();
    const materials = this.allMaterials();
    if (!selected) return materials;

    return materials.filter((m: Material) => {
      if (selected.name === 'Divers') {
        return !m.category_id || m.category_id === 0;
      }
      return Number(m.category_id) === Number(selected.id);
    });
  });

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  /**
   * RÉCUPÉRATION DES DONNÉES
   */
  private fetchData(): void {
    this.isLoading.set(true);

    forkJoin({
      categories: this.catalogService.getCategories().pipe(catchError(() => of([]))),
      materials: this.catalogService.getAllMaterials().pipe(catchError(() => of([]))),
      slides: this.carouselService.getPublicCarousel().pipe(catchError(() => of([])))
    })
    .pipe(
      finalize(() => {
        this.isLoading.set(false);
        this.startAutoScroll();
      })
    )
    .subscribe({
      next: (res) => {
        const finalCategories = this.enrichCategories(res.categories, res.materials);
        this.categories.set(finalCategories);
        
        // Tri des slides par 'order'
        const sortedSlides = [...res.slides].sort((a, b) => (a.order || 0) - (b.order || 0));
        this.carouselData.set(sortedSlides);
        
        this.processMaterials(finalCategories, res.materials);
      },
      error: (err) => console.error('Erreur catalogue:', err)
    });
  }

  /**
   * GESTION DES ACTIONS DU CARROUSEL
   * Intercepte le clic si le lien est un déclencheur de modal (#login)
   */
  handleCarouselAction(slide: Carousel, event: Event): void {
    const link = slide.link || slide.link;
    
    if (link === '#login') {
      event.preventDefault(); // Empêche la navigation routeur
      this.openLoginModalEvent.emit(); // Déclenche le modal via le parent
    }
  }

  private enrichCategories(categories: Category[], materials: Material[]): Category[] {
    const hasOrphans = materials.some(m => !m.category_id || !categories.find(c => c.id === m.category_id));
    if (hasOrphans) {
      const diversCategory: Category = { id: 0, name: 'Divers', description: 'Matériaux variés', image_url: '' };
      return [...categories, diversCategory];
    }
    return categories;
  }

  private processMaterials(categories: Category[], materialsData: Material[]): void {
    const processed = materialsData.map((m: Material) => {
      let categoryObj = categories.find(c => Number(c.id) === Number(m.category_id));
      if (!categoryObj) categoryObj = categories.find(c => c.name === 'Divers');
      return {
        ...m,
        category: categoryObj,
        image_url: m.image_url || 'assets/Logo/default-material.jpg'
      };
    });
    this.allMaterials.set(processed);
  }

  // --- Logique Carrousel ---
  private startAutoScroll(): void {
    this.stopAutoScroll();
    if (this.carouselData().length > 1) {
      this.autoScrollTimer = setInterval(() => this.nextSlide(), this.SCROLL_INTERVAL);
    }
  }

  private stopAutoScroll(): void {
    if (this.autoScrollTimer) clearInterval(this.autoScrollTimer);
  }

  nextSlide(): void {
    const total = this.carouselData().length;
    if (total <= 1) return;
    this.currentSlideIndex.update(idx => (idx + 1) % total);
  }

  prevSlide(): void {
    const total = this.carouselData().length;
    if (total <= 1) return;
    this.currentSlideIndex.update(idx => (idx - 1 + total) % total);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
    this.startAutoScroll();
  }

  // --- Filtrage ---
  selectCategory(category: Category | null): void {
    if (category && this.selectedCategory()?.id === category.id) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(category);
    }
    
    setTimeout(() => {
      const element = document.getElementById('material-explorer-section');
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }
}