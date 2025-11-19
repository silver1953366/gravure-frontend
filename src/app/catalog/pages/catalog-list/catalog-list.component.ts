import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { forkJoin } from 'rxjs';

import { CatalogService } from '../../../core/services/catalog/catalog.service';
import { Category } from '../../../core/models/category.model';
import { Material } from '../../../core/models/material.model';

// --- Interface pour les slides du carrousel ---
interface CarouselSlide {
	title: string;
	subtitle: string;
	imageUrl: string;
	categoryName: string;
	link: string;
}

// Type étendu pour l'affichage, incluant l'objet Category pour la jointure
interface MaterialDisplay extends Material {
	category?: Category;
}

@Component({
	selector: 'app-catalog-list',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './catalog-list.component.html', 
	styleUrl: './catalog-list.component.css',   
})
export class CatalogListComponent implements OnInit, OnDestroy {
	private catalogService = inject(CatalogService);

	// --- États ---
	categories = signal<Category[]>([]);
	allMaterials = signal<MaterialDisplay[]>([]); 
	selectedCategory = signal<Category | null>(null);
	isLoading = signal(false);

	// --- Gestion du Carrousel ---
	currentSlideIndex = signal(0);
	private autoScrollTimer: any;
	private readonly SCROLL_INTERVAL = 5000; // 5 secondes
	
	// 💥 CHANGEMENT : Le tableau est renommé en 'carouselData' et les chemins d'images sont vérifiés.
	public carouselData: CarouselSlide[] = [
		// 1. Slide d'Accueil
		{
			title: "Bienvenue chez E.M.E.S Gravure-plaque !",
			subtitle: "Découvrez la matière parfaite pour votre projet de gravure ou découpe.",
			imageUrl: '../../../../assets/Logo/carrousel3.jpg', 
			categoryName: 'Accueil',
			link: '/about' 
		},
		
	];


	// --- Computed : Filtration des matériaux ---
	filteredMaterials = computed(() => {
		const selected = this.selectedCategory();
		const materials = this.allMaterials();

		if (!selected) {
			return materials;
		}
		return materials.filter(material => material.category_id === selected.id);
	});


	ngOnInit(): void {
		this.fetchCatalogData(); 
		this.startAutoScroll();
	}
	
	ngOnDestroy(): void {
		this.stopAutoScroll();
	}

	startAutoScroll(): void {
		this.stopAutoScroll();
		this.autoScrollTimer = setInterval(() => {
			this.nextSlide();
		}, this.SCROLL_INTERVAL);
	}

	stopAutoScroll(): void {
		if (this.autoScrollTimer) {
			clearInterval(this.autoScrollTimer);
		}
	}

	nextSlide(): void {
		// 💥 Mise à jour de la référence à 'carouselData'
		const totalSlides = this.carouselData.length;
		const nextIndex = (this.currentSlideIndex() + 1) % totalSlides; 
		this.goToSlide(nextIndex);
	}

	goToSlide(index: number): void {
		this.currentSlideIndex.set(index);
		this.startAutoScroll(); // Redémarre le timer après une interaction manuelle
	}

	fetchCatalogData(): void {
		this.isLoading.set(true);
		
		forkJoin({
			categories: this.catalogService.getCategories(),
			materials: this.catalogService.getAllMaterials()
		}).subscribe({
			next: ({ categories, materials }) => {
				this.categories.set(categories);
				this.loadMaterials(categories, materials);
			},
			error: (err) => {
				console.error('Erreur chargement des données:', err);
				this.isLoading.set(false);
			}
		});
	}

	loadMaterials(categories: Category[], materialsData: Material[]): void {
		const materialsWithCategory: MaterialDisplay[] = materialsData.map(material => {
			const category = categories.find(c => c.id === material.category_id);
			let tempImageUrl = material.image_url; 

			// Logique d'injection d'images temporaires
			if (!tempImageUrl) {
				const materialName = material.name.toLowerCase().split(' ')[0];
				
				switch (materialName) {
					// Chemins de matériaux uniformisés
					case 'acier':
					case 'inox':
					case 'carbone':
					case 'métal':
						tempImageUrl = '../../../../assets/material/aluminium.jpg'; 
						break;
					case 'aluminium':
						tempImageUrl = '../../../../assets/material/aluminium.jpg';
						break;
					case 'laiton':
					case 'cuivre':
					case 'bronze':
						tempImageUrl = '../../../../assets/material/laiton.jpg';
						break;
					case 'teflon':
					case 'peek':
					case 'nylon':
					case 'acrylique':
						tempImageUrl = '../../../../assets/material/acrylique.jpg';
						break;
					case 'fibre':
					case 'composite':
						tempImageUrl = '../../../../assets/material/acrylique.jpg';
						break;
					case 'granit':
					case 'pierre':
						tempImageUrl = '../../../../assets/material/granit.jpg';
						break;
					default:
						tempImageUrl = '../../../../assets/Logo/1713884336384.jpg';
					}
			}
			
			return {
				...material,
				category: category, 
				image_url: tempImageUrl 
			} as MaterialDisplay;
		});

		this.allMaterials.set(materialsWithCategory);
		this.isLoading.set(false);
	}

	selectCategory(category: Category | null): void {
		if (category && this.selectedCategory()?.id === category.id) {
			this.selectedCategory.set(null);
		} else {
			this.selectedCategory.set(category);
		}
	}
}