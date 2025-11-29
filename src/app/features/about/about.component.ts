import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  ngAfterViewInit() {
    // Initialiser le carousel des témoignages
    this.initializeCarousels();
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

