import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="video-modal-content" (click)="$event.stopPropagation()">
        <button class="video-modal-close" (click)="closeModal()" aria-label="Fermer">
          <span>&times;</span>
        </button>
        <div class="video-modal-iframe-container" *ngIf="videoUrl">
          <iframe
            [src]="videoUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-modal-iframe">
          </iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .video-modal-content {
      position: relative;
      width: 90%;
      max-width: 1200px;
      max-height: 90vh;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .video-modal-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      font-size: 32px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      transition: all 0.3s ease;
      line-height: 1;
      padding: 0;
    }

    .video-modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .video-modal-iframe-container {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      height: 0;
      overflow: hidden;
    }

    .video-modal-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    @media (max-width: 768px) {
      .video-modal-content {
        width: 95%;
        max-height: 80vh;
      }

      .video-modal-close {
        top: 5px;
        right: 5px;
        width: 35px;
        height: 35px;
        font-size: 28px;
      }
    }

    /* Dark mode support */
    .dark .video-modal-overlay {
      background-color: rgba(0, 0, 0, 0.95);
    }
  `]
})
export class VideoModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() youtubeVideoId: string = '';
  @Output() close = new EventEmitter<void>();

  videoUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.updateVideoUrl();
    // Prevent body scroll when modal is open
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['youtubeVideoId'] || changes['isOpen']) {
      this.updateVideoUrl();
    }
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  updateVideoUrl() {
    if (this.youtubeVideoId) {
      // Convert YouTube URL or ID to embed URL
      let videoId = this.youtubeVideoId;
      
      // If it's a full YouTube URL, extract the ID
      if (videoId.includes('youtube.com/watch?v=')) {
        videoId = videoId.split('v=')[1].split('&')[0];
      } else if (videoId.includes('youtu.be/')) {
        videoId = videoId.split('youtu.be/')[1].split('?')[0];
      } else if (videoId.includes('youtube.com/embed/')) {
        videoId = videoId.split('embed/')[1].split('?')[0];
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
  }

  closeModal() {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.close.emit();
  }
}

