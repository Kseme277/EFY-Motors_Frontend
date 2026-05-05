import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly siteName = 'EFY Motors';
  private readonly baseUrl = 'https://efymotors.com';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Updates the page metadata
   * @param title Page title
   * @param description Page description
   * @param image Page image (social sharing)
   * @param url Page canonical URL
   */
  updateMeta(title: string, description: string, image?: string, url?: string) {
    const fullTitle = `${title} | ${this.siteName}`;
    const fullUrl = url ? `${this.baseUrl}${url}` : this.baseUrl;
    const fullImage = image || `${this.baseUrl}/assets/images/car-3.jpg`;

    // Standard SEO
    this.titleService.setTitle(fullTitle);
    this.metaService.updateTag({ name: 'description', content: description });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: fullImage });
    this.metaService.updateTag({ property: 'og:url', content: fullUrl });

    // Twitter
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: fullImage });

    // Canonical
    this.updateCanonical(fullUrl);
  }

  /**
   * Updates the canonical link in the head
   */
  private updateCanonical(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }
}
