import { Component, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarCardComponent, CarCard } from '../../shared/components/car-card/car-card.component';
import { VideoModalComponent } from '../../shared/components/video-modal/video-modal.component';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';
import { ApiService } from '../../services/api.service';

declare var $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, VideoModalComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private heroCarouselInstance: any;
  private carCarouselInstance: any;
  private testimonyCarouselInstance: any;

  featuredCars: CarCard[] = [];
  recentCars: CarCard[] = [];
  recentHoveredImage: Record<number, string> = {};
  isVideoModalOpen = false;
  currentVideoId = '';
  isLoadingFeatured: boolean = true;
  
  searchParams: any = {
    marque: '',
    carburant: '',
    prix_min: null,
    prix_max: null,
    ville: ''
  };

  reviews: any[] = [];
  currentReviewIndex: number = 0;
  private reviewInterval: any;

  constructor(
    private scrollAnimationService: ScrollAnimationService,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private metaService: Meta
  ) {}

  onSearch() {
    // Filtrer les paramètres vides
    const queryParams: any = {};
    if (this.searchParams.marque) queryParams.brand = this.searchParams.marque;
    if (this.searchParams.carburant) queryParams.fuel = this.searchParams.carburant;
    if (this.searchParams.prix_min) queryParams.minPrice = this.searchParams.prix_min;
    if (this.searchParams.prix_max) queryParams.maxPrice = this.searchParams.prix_max;
    
    this.router.navigate(['/cars'], { queryParams });
  }

  openVideoModal(videoId: string) {
    this.currentVideoId = videoId;
    this.isVideoModalOpen = true;
  }

  closeVideoModal() {
    this.isVideoModalOpen = false;
    this.currentVideoId = '';
  }

  ngOnInit() {
    this.setSEO();
    this.loadFeaturedVehicles();
    this.loadRecentVehicles();
    this.loadReviews();
  }

  private setSEO() {
    this.titleService.setTitle('EFY Motors | Vente de voitures neuves et d\'occasion au Cameroun');
    this.metaService.updateTag({ name: 'description', content: 'Découvrez les meilleures offres de voitures au Cameroun avec EFY Motors. Large choix de marques, prix compétitifs et service de qualité à Yaoundé.' });
    this.metaService.updateTag({ property: 'og:title', content: 'EFY Motors | Votre expert automobile au Cameroun' });
  }

  private extractVehicles(response: any): any[] {
    if (response && response.items) return response.items;
    if (response && response.results) return response.results;
    if (response && response.vehicules) return response.vehicules;
    if (Array.isArray(response)) return response;
    if (response && response.data) return response.data;
    return [];
  }

  private mapVehicleToCarCard(vehicle: any): CarCard {
    const photos = this.extractVehiclePhotos(vehicle);
    return {
      id: vehicle.id,
      name: vehicle.marque && vehicle.modele ? `${vehicle.marque} ${vehicle.modele}` : (vehicle.nom || 'Véhicule sans nom'),
      image: photos[0] || 'assets/images/car-1.jpg',
      tags: vehicle.tags || (vehicle.marque ? [vehicle.marque] : []),
      price: vehicle.prix || 0,
      brand: vehicle.marque || 'Inconnu',
      mileage: vehicle.kilometrage || 0,
      transmission: vehicle.boite_vitesse || 'Automatique',
      seats: vehicle.nombre_places || 5,
      luggage: vehicle.nombre_bagages || 0,
      fuel: vehicle.carburant || 'Essence',
      nombre_avis: vehicle.nombre_avis || 0,
      rating: vehicle.rating || 0,
      annee: vehicle.annee,
      photos: photos
    } as CarCard;
  }

  private extractVehiclePhotos(vehicle: any): string[] {
    const photos: string[] = [];
    if (vehicle?.photo_principale) {
      photos.push(vehicle.photo_principale);
    }
    if (vehicle?.photos && Array.isArray(vehicle.photos)) {
      for (const photo of vehicle.photos) {
        if (photo && !photos.includes(photo)) {
          photos.push(photo);
        }
      }
    }
    return photos.length > 0 ? photos : ['assets/images/car-1.jpg'];
  }

  getRecentCardImage(car: CarCard): string {
    return this.recentHoveredImage[car.id] || car.image;
  }

  onRecentCardMove(event: MouseEvent, car: CarCard) {
    const photos = ((car as any).photos || []) as string[];
    if (!photos || photos.length < 2) return;

    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(event.clientX - rect.left, rect.width - 1));
    const ratio = rect.width > 0 ? relativeX / rect.width : 0;
    const photoIndex = Math.floor(ratio * photos.length);
    this.recentHoveredImage[car.id] = photos[Math.min(photoIndex, photos.length - 1)];
  }

  onRecentCardLeave(car: CarCard) {
    delete this.recentHoveredImage[car.id];
  }

  private loadRecentVehicles() {
    this.apiService.getVehicles({ page: 1, size: 8, est_disponible: true }).subscribe({
      next: (response) => {
        const vehicles = this.extractVehicles(response);
        const uniqueVehicles = vehicles.filter((vehicle: any, index: number, self: any[]) =>
          vehicle && vehicle.id && index === self.findIndex((v: any) => v.id === vehicle.id)
        );
        this.recentCars = uniqueVehicles.slice(0, 8).map((vehicle: any) => this.mapVehicleToCarCard(vehicle));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules récents:', error);
        this.recentCars = [];
      }
    });
  }

  private loadReviews() {
    this.apiService.getAllReviews(1, 10, 'approuve').subscribe({
      next: (response) => {
        if (response && response.items) {
          this.reviews = response.items;
          if (this.reviews.length > 0) {
            this.startReviewRotation();
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
      }
    });
  }

  private startReviewRotation() {
    this.reviewInterval = setInterval(() => {
      this.currentReviewIndex = (this.currentReviewIndex + 1) % this.reviews.length;
    }, 2000);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  private loadFeaturedVehicles() {
    this.isLoadingFeatured = true;
    // Utiliser getVehicles avec le filtre is_featured pour plus de fiabilité
    this.apiService.getVehicles({ is_featured: true, limit: 10 }).subscribe({
      next: (response) => {
        console.log('API Response for featured vehicles:', response);
        const vehicles: any[] = this.extractVehicles(response);
        
        // Filtrer les doublons par ID
        const uniqueVehicles = vehicles.filter((vehicle: any, index: number, self: any[]) => 
          vehicle && vehicle.id && index === self.findIndex((v: any) => v.id === vehicle.id)
        );
        
        this.featuredCars = uniqueVehicles.map((vehicle: any) => this.mapVehicleToCarCard(vehicle));
        this.isLoadingFeatured = false;
        
        // Forcer la détection de changements pour Angular
        this.cdr.detectChanges();
        
        // Réinitialiser le carousel après le chargement des données avec un délai plus robuste
        setTimeout(() => {
          this.initializeCarCarousel();
        }, 1200);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules en vedette:', error);
        this.featuredCars = [];
        this.isLoadingFeatured = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    // Initialiser tous les carousels après que la vue soit initialisée
    this.initializeCarousels();
    
    // Initialiser le compteur si waypoint est disponible
    this.initializeCounter();
    
    // Initialiser les animations de scroll
    this.initializeScrollAnimations();
  }
  
  private initializeScrollAnimations() {
    setTimeout(() => {
      const elements = document.querySelectorAll('.present, .present-left, .present-right, .present-zoom, .reveal-up, .reveal-fade, .present-delay-1, .present-delay-2, .present-delay-3, .present-delay-4, .present-delay-5');
      this.scrollAnimationService.observeElements(elements);
    }, 100);
  }
  
  private initializeCounter() {
    if (typeof $ === 'undefined') {
      setTimeout(() => this.initializeCounter(), 200);
      return;
    }
    
    setTimeout(() => {
      const counterSection = document.getElementById('section-counter');
      if (!counterSection) {
        setTimeout(() => this.initializeCounter(), 200);
        return;
      }
      
      if (counterSection.classList.contains('counter-initialized')) {
        return;
      }
      
      counterSection.classList.add('counter-initialized');
      
      const animateNumbers = () => {
        if (counterSection.classList.contains('ftco-animated')) {
          return;
        }
        counterSection.classList.add('ftco-animated');
        
        const numbers = counterSection.querySelectorAll('.number');
        
        // Vérifier si animateNumber est disponible
        if (typeof $.animateNumber !== 'undefined' && $.animateNumber.numberStepFactories) {
          const comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
          
          numbers.forEach((element: Element) => {
            const $this = $(element);
            const num = $this.data('number');
            if (num) {
              $this.animateNumber({
                number: num,
                numberStep: comma_separator_number_step
              }, 7000);
            }
          });
        } else {
          // Fallback si animateNumber n'est pas disponible
          numbers.forEach((element: Element) => {
            const $this = $(element);
            const num = $this.data('number');
            if (num) {
              let current = 0;
              const increment = num / 100;
              const timer = setInterval(() => {
                current += increment;
                if (current >= num) {
                  current = num;
                  clearInterval(timer);
                }
                $this.text(Math.floor(current).toLocaleString('fr-FR'));
              }, 70);
            }
          });
        }
      };
      
      // Vérifier si la section est déjà visible
      const rect = counterSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        // Si déjà visible, animer immédiatement
        setTimeout(() => animateNumbers(), 300);
      }
      
      // Utiliser Intersection Observer (plus fiable)
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              animateNumbers();
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });
        
        observer.observe(counterSection);
      } else if (typeof $.fn.waypoint !== 'undefined') {
        // Fallback avec waypoint
        $(counterSection).waypoint(function(direction: string) {
          if (direction === 'down') {
            animateNumbers();
          }
        }, { offset: '80%' });
      } else {
        // Dernier fallback: animer après un court délai
        setTimeout(() => {
          animateNumbers();
        }, 1000);
      }
    }, 1500);
  }

  private initializeCarCarousel(retryCount: number = 0) {
    // Vérifier que jQuery et owlCarousel sont disponibles
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') {
      // Réessayer après un court délai
      if (retryCount < 10) {
        setTimeout(() => this.initializeCarCarousel(retryCount + 1), 300);
      }
      return;
    }

    const $carCarousel = $('.carousel-car');
    
    // Si le carousel n'est pas encore dans le DOM (Angular est encore en train de charger)
    if ($carCarousel.length === 0 || $carCarousel.children('.item').length === 0) {
      if (retryCount < 10 && this.featuredCars.length > 0) {
        setTimeout(() => this.initializeCarCarousel(retryCount + 1), 300);
      }
      return;
    }

    try {
      // Détruire toutes les instances existantes pour éviter les doublons
      if ($carCarousel.hasClass('owl-loaded')) {
        $carCarousel.owlCarousel('destroy');
        $carCarousel.removeClass('owl-loaded owl-drag');
        $carCarousel.find('.owl-stage-outer').children().unwrap();
      }
      
      // Réinitialiser complètement les données jQuery
      $carCarousel.removeData('owl.carousel');
      
      this.carCarouselInstance = $carCarousel.owlCarousel({
        items: 3,
        loop: this.featuredCars.length > 3,
        margin: 20,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        nav: false,
        dots: true,
        smartSpeed: 800,
        responsive: {
          0: { items: 1 },
          768: { items: 2 },
          1200: { items: 3 }
        },
        onInitialized: () => {
          // Afficher le carousel une fois initialisé
          $carCarousel.css('opacity', '1');
          
          // Hook custom nav buttons
          $('.featured-items-section .nav-btn.prev').off('click').on('click', () => {
            $carCarousel.trigger('prev.owl.carousel');
          });
          $('.featured-items-section .nav-btn.next').off('click').on('click', () => {
            $carCarousel.trigger('next.owl.carousel');
          });
        }
      });
    } catch (e) {
      console.error('Error initializing car carousel:', e);
    }
  }

  private initializeCarousels() {
    // Vérifier que jQuery et owlCarousel sont disponibles
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') {
      // Réessayer après un court délai
      setTimeout(() => this.initializeCarousels(), 200);
      return;
    }

    setTimeout(() => {

      // Carousel hero
      if ($('.hero-carousel').length && !this.heroCarouselInstance) {
        try {
          // Vérifier si le carousel existe déjà et le détruire proprement
          const $heroCarousel = $('.hero-carousel');
          if ($heroCarousel.hasClass('owl-loaded')) {
            try {
              $heroCarousel.owlCarousel('destroy');
            } catch (e) {
              // Ignorer si déjà détruit
            }
          }
          
          this.heroCarouselInstance = $heroCarousel.owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            nav: false,
            dots: true,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            smartSpeed: 1000
          });
        } catch (e) {
          console.error('Error initializing hero carousel:', e);
        }
      }

      // Carousel des témoignages
      if ($('.carousel-testimony').length && !this.testimonyCarouselInstance) {
        try {
          // Vérifier si le carousel existe déjà et le détruire proprement
          const $testimonyCarousel = $('.carousel-testimony');
          if ($testimonyCarousel.hasClass('owl-loaded')) {
            try {
              $testimonyCarousel.owlCarousel('destroy');
            } catch (e) {
              // Ignorer si déjà détruit
            }
          }
          
          this.testimonyCarouselInstance = $testimonyCarousel.owlCarousel({
            items: 1,
            loop: true,
            margin: 30,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            nav: true,
            dots: true,
            navText: ['<span class="ion-ios-arrow-back"></span>', '<span class="ion-ios-arrow-forward"></span>']
          });
        } catch (e) {
          console.error('Error initializing testimony carousel:', e);
        }
      }
    }, 500);
  }

  ngOnDestroy() {
    // Détruire tous les carousels lors de la destruction du composant
    try {
      if (typeof $ === 'undefined') {
        return;
      }

      // Détruire le carousel hero
      if ($('.hero-carousel').length && $('.hero-carousel').hasClass('owl-loaded')) {
        try {
          $('.hero-carousel').owlCarousel('destroy');
        } catch (e) {
          // Ignorer l'erreur si le carousel n'est pas initialisé
        }
        this.heroCarouselInstance = null;
      }
      
      // Détruire le carousel des véhicules
      if ($('.carousel-car').length && $('.carousel-car').hasClass('owl-loaded')) {
        try {
          $('.carousel-car').owlCarousel('destroy');
        } catch (e) {
          // Ignorer l'erreur si le carousel n'est pas initialisé
        }
        this.carCarouselInstance = null;
      }
      
      // Détruire le carousel des témoignages
      if ($('.carousel-testimony').length && $('.carousel-testimony').hasClass('owl-loaded')) {
        try {
          $('.carousel-testimony').owlCarousel('destroy');
        } catch (e) {
          // Ignorer l'erreur si le carousel n'est pas initialisé
        }
        this.testimonyCarouselInstance = null;
      }
    } catch (e) {
      // Ignorer toutes les erreurs lors de la destruction
      console.warn('Warning during carousel cleanup:', e);
    }
  }
}

