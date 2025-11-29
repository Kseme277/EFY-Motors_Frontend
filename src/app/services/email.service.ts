import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly SERVICE_ID = 'YOUR_SERVICE_ID'; // À remplacer par ton Service ID EmailJS
  private readonly TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // À remplacer par ton Template ID EmailJS
  private readonly PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // À remplacer par ta Public Key EmailJS

  constructor() {
    // Initialiser EmailJS
    emailjs.init(this.PUBLIC_KEY);
  }

  async sendEmail(templateParams: {
    from_name: string;
    from_email: string;
    subject: string;
    message: string;
    to_email?: string;
  }): Promise<any> {
    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        {
          ...templateParams,
          to_email: templateParams.to_email || 'kseme277@gmail.com'
        }
      );
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }
}

