import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { delay, filter, map, tap } from 'rxjs/operators';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('efy-motors');

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);
  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);
  readonly themeService = inject(ThemeService);

  constructor() {
    // Ne pas changer le titre ici - le garder tel quel depuis index.html
    // Le titre sera géré par les composants individuels si nécessaire
    // iconSet singleton
    this.#iconSetService.icons = { ...iconSubset };
    this.#colorModeService.localStorageItemName.set('efy-motors-admin-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }

  ngOnInit() {
    // Initialize theme service to apply saved theme
    this.themeService.theme$.subscribe();

    this.#router.events.pipe(
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.#colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
