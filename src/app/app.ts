import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Initialize theme service to apply saved theme
    this.themeService.theme$.subscribe();
  }
}
