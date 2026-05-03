import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsent implements OnInit {
  showBanner: boolean = false;

  ngOnInit() {
    this.checkConsent();
  }

  private checkConsent() {
    const consent = this.getCookie('cookie-consent');
    if (!consent) {
      // Delay showing the banner for better UX
      setTimeout(() => {
        this.showBanner = true;
      }, 1500);
    }
  }

  acceptAll() {
    this.setCookie('cookie-consent', 'all', 365);
    this.showBanner = false;
  }

  refuseAll() {
    this.setCookie('cookie-consent', 'essential', 365);
    this.showBanner = false;
  }

  showSettings() {
    // Logic for settings could be implemented here
    console.log('Paramètres des cookies');
  }

  private setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  private getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
