import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  onSubmit() {
    // Validation des champs
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.subject || !this.contactForm.message) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactForm.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Envoyer le message via l'API backend
    this.apiService.sendContactMessage({
      name: this.contactForm.name,
      email: this.contactForm.email,
      subject: this.contactForm.subject,
      message: this.contactForm.message
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.';
        this.contactForm = { name: '', email: '', subject: '', message: '' };
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'envoi du message:', error);
        this.errorMessage = error.error?.detail || 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.';
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 8000);
      }
    });
  }
}

