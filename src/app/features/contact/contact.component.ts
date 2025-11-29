import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

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

  // Configuration EmailJS - À configurer avec tes identifiants
  private readonly SERVICE_ID = 'YOUR_SERVICE_ID'; // Remplace par ton Service ID EmailJS
  private readonly TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Remplace par ton Template ID EmailJS
  private readonly PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Remplace par ta Public Key EmailJS
  private readonly TO_EMAIL = 'kseme@gmail.com';

  constructor() {
    // Initialiser EmailJS
    emailjs.init(this.PUBLIC_KEY);
  }

  async onSubmit() {
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        {
          from_name: this.contactForm.name,
          from_email: this.contactForm.email,
          subject: this.contactForm.subject,
          message: this.contactForm.message,
          to_email: this.TO_EMAIL
        }
      );

      this.isLoading = false;
      this.successMessage = 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.';
      this.contactForm = { name: '', email: '', subject: '', message: '' };
      
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } catch (error: any) {
      this.isLoading = false;
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      this.errorMessage = 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement à ' + this.TO_EMAIL;
      
      setTimeout(() => {
        this.errorMessage = '';
      }, 8000);
    }
  }
}

