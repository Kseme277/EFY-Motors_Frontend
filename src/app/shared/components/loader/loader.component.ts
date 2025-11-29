import { Component, AfterViewInit, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit, AfterViewInit {
  ngOnInit() {
    // Masquer le loader immédiatement
    this.hideLoader();
  }

  ngAfterViewInit() {
    // Masquer le loader immédiatement après le rendu
    setTimeout(() => {
      this.hideLoader();
    }, 100);
  }

  private hideLoader() {
    const loader = document.getElementById('ftco-loader');
    if (loader) {
      loader.classList.remove('show');
      loader.classList.add('hidden');
      // Forcer le masquage avec les styles inline
      loader.style.display = 'none';
      loader.style.visibility = 'hidden';
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
    }
  }
}

