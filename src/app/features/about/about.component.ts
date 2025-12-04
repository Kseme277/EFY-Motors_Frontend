import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';

declare var $: any;

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private testimonyCarouselInstance: any;

  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngAfterViewInit() {
    // Initialiser le carousel des témoignages
    this.initializeCarousels();
    
    // Initialiser les animations de scroll
    this.initializeScrollAnimations();
  }
  
  private initializeScrollAnimations() {
    setTimeout(() => {
      const elements = document.querySelectorAll('.present, .present-left, .present-right, .present-zoom, .present-delay-1, .present-delay-2, .present-delay-3, .present-delay-4, .present-delay-5');
      this.scrollAnimationService.observeElements(elements);
    }, 100);
  }

  private initializeCarousels() {
    // Vérifier que jQuery et owlCarousel sont disponibles
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') {
      // Réessayer après un court délai
      setTimeout(() => this.initializeCarousels(), 200);
      return;
    }

    setTimeout(() => {
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
    // Détruire le carousel lors de la destruction du composant
    try {
      if (typeof $ === 'undefined') {
        return;
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

