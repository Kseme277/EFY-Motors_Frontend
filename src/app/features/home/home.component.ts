import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarCardComponent, CarCard } from '../../shared/components/car-card/car-card.component';
import { getFeaturedCars } from '../../data/featured-cars.data';
import { VideoModalComponent } from '../../shared/components/video-modal/video-modal.component';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';

declare var $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, VideoModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private heroCarouselInstance: any;
  private carCarouselInstance: any;
  private testimonyCarouselInstance: any;

  featuredCars: CarCard[] = [];
  isVideoModalOpen = false;
  currentVideoId = '';
  isLoadingFeatured: boolean = false;

  constructor(private scrollAnimationService: ScrollAnimationService) {}

  openVideoModal(videoId: string) {
    this.currentVideoId = videoId;
    this.isVideoModalOpen = true;
  }

  closeVideoModal() {
    this.isVideoModalOpen = false;
    this.currentVideoId = '';
  }

  ngOnInit() {
    // Utiliser les données statiques pour les véhicules en vedette
    const featuredCarsData = getFeaturedCars();
    this.featuredCars = featuredCarsData.map(car => ({
      id: car.id,
      name: car.name,
      image: car.image,
      tags: [car.brand],
      price: car.price,
      brand: car.brand,
      mileage: car.mileage,
      transmission: car.transmission,
      seats: car.seats,
      luggage: car.luggage,
      fuel: car.fuel,
    }));
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
      const elements = document.querySelectorAll('.present, .present-left, .present-right, .present-zoom, .present-delay-1, .present-delay-2, .present-delay-3, .present-delay-4, .present-delay-5');
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

  private initializeCarousels() {
    // Vérifier que jQuery et owlCarousel sont disponibles
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') {
      // Réessayer après un court délai
      setTimeout(() => this.initializeCarousels(), 200);
      return;
    }

    setTimeout(() => {
      // Carousel des véhicules - initialiser en premier
      if ($('.carousel-car').length && !this.carCarouselInstance) {
        try {
          const $carCarousel = $('.carousel-car');
          
          // Détruire toutes les instances existantes
          if ($carCarousel.hasClass('owl-loaded')) {
            try {
              $carCarousel.trigger('destroy.owl.carousel');
              $carCarousel.removeClass('owl-loaded owl-drag');
              $carCarousel.find('.owl-stage-outer').children().unwrap();
            } catch (e) {
              // Ignorer si déjà détruit
            }
          }
          
          // Réinitialiser complètement
          $carCarousel.removeData();
          
          this.carCarouselInstance = $carCarousel.owlCarousel({
            items: 2,
            loop: true,
            margin: 30,
            autoplay: true,
            autoplayTimeout: 4000,
            autoplayHoverPause: true,
            nav: true,
            dots: true,
            navText: ['<span class="ion-ios-arrow-back"></span>', '<span class="ion-ios-arrow-forward"></span>'],
            slideBy: 1,
            smartSpeed: 800,
            responsive: {
              0: { items: 1, margin: 20, nav: false },
              768: { items: 2, margin: 30, nav: true }
            },
            onInitialized: () => {
              // Afficher le carousel une fois initialisé
              $carCarousel.css('opacity', '1');
            }
          });
        } catch (e) {
          console.error('Error initializing car carousel:', e);
        }
      }

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

