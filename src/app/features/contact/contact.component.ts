import { Component, AfterViewInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  faqs = [
    {
      question: 'Comment puis-je prendre rendez-vous pour un essai ?',
      answer: 'Vous pouvez nous appeler directement au +237 697 364 696 ou remplir le formulaire ci-dessus en précisant le modèle qui vous intéresse. Nous vous rappellerons pour fixer un créneau.',
      isOpen: false
    },
    {
      question: 'Proposez-vous des reprises de véhicules ?',
      answer: 'Oui, nous évaluons votre véhicule actuel et pouvons déduire sa valeur du prix d\'achat de votre nouveau véhicule chez EFY Motors.',
      isOpen: false
    },
    {
      question: 'Quelles sont vos garanties après-vente ?',
      answer: 'Tous nos véhicules certifiés bénéficient d\'une garantie minimale de 6 mois couvrant le moteur et la boîte de vitesses, avec une assistance routière incluse.',
      isOpen: false
    },
    {
      question: 'Livrez-vous les véhicules dans d\'autres villes ?',
      answer: 'Absolument. Nous organisons la livraison sécurisée de votre véhicule partout au Cameroun (Douala, Bafoussam, Garoua, etc.) après finalisation de la vente.',
      isOpen: false
    }
  ];

  constructor(
    private apiService: ApiService,
    private scrollAnimationService: ScrollAnimationService
  ) {}

  ngAfterViewInit() {
    this.initializeScrollAnimations();
  }

  private initializeScrollAnimations() {
    setTimeout(() => {
      const elements = document.querySelectorAll('.present, .present-left, .present-right, .present-zoom, .reveal-up, .reveal-fade, .present-delay-1, .present-delay-2, .present-delay-3, .present-delay-4, .present-delay-5');
      this.scrollAnimationService.observeElements(elements);
    }, 100);
  }

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

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
        this.errorMessage = error.error?.detail || 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.';
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 8000);
      }
    });
  }
}
