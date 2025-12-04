import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollAnimationService {
  private observer: IntersectionObserver | null = null;
  private observedElements: Set<Element> = new Set();

  constructor(private ngZone: NgZone) {
    this.initObserver();
  }

  private initObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.ngZone.run(() => {
                this.animateElement(entry.target);
              });
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );
    });
  }

  private animateElement(element: Element) {
    const htmlElement = element as HTMLElement;
    
    // Vérifier si l'élément a déjà été animé
    if (htmlElement.classList.contains('scroll-animated')) {
      return;
    }

    // Ajouter la classe pour marquer comme animé
    htmlElement.classList.add('scroll-animated');

    // Déclencher l'animation selon la classe présente
    if (htmlElement.classList.contains('present')) {
      htmlElement.classList.add('present-animated');
    } else if (htmlElement.classList.contains('present-left')) {
      htmlElement.classList.add('present-left-animated');
    } else if (htmlElement.classList.contains('present-right')) {
      htmlElement.classList.add('present-right-animated');
    } else if (htmlElement.classList.contains('present-zoom')) {
      htmlElement.classList.add('present-zoom-animated');
    } else if (htmlElement.classList.contains('present-delay-1')) {
      htmlElement.classList.add('present-delay-1-animated');
    } else if (htmlElement.classList.contains('present-delay-2')) {
      htmlElement.classList.add('present-delay-2-animated');
    } else if (htmlElement.classList.contains('present-delay-3')) {
      htmlElement.classList.add('present-delay-3-animated');
    } else if (htmlElement.classList.contains('present-delay-4')) {
      htmlElement.classList.add('present-delay-4-animated');
    } else if (htmlElement.classList.contains('present-delay-5')) {
      htmlElement.classList.add('present-delay-5-animated');
    }

    // Ne plus observer cet élément
    if (this.observer) {
      this.observer.unobserve(element);
      this.observedElements.delete(element);
    }
  }

  observeElement(element: Element) {
    if (!this.observer || this.observedElements.has(element)) {
      return;
    }

    this.observedElements.add(element);
    this.observer.observe(element);
  }

  observeElements(elements: NodeListOf<Element> | Element[]) {
    if (!this.observer) {
      return;
    }

    elements.forEach(element => {
      if (!this.observedElements.has(element)) {
        this.observedElements.add(element);
        this.observer!.observe(element);
      }
    });
  }

  unobserveElement(element: Element) {
    if (this.observer && this.observedElements.has(element)) {
      this.observer.unobserve(element);
      this.observedElements.delete(element);
    }
  }

  destroy() {
    if (this.observer) {
      this.observedElements.forEach(element => {
        this.observer!.unobserve(element);
      });
      this.observedElements.clear();
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

