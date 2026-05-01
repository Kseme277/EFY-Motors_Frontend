import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  
  /**
   * Affiche un message de succès
   */
  success(title: string, message?: string) {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#0f3bff',
      confirmButtonText: 'OK'
    });
  }

  /**
   * Affiche un message d'erreur
   */
  error(title: string, message?: string) {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'OK'
    });
  }

  /**
   * Affiche un message d'information
   */
  info(title: string, message?: string) {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonColor: '#0f3bff',
      confirmButtonText: 'OK'
    });
  }

  /**
   * Affiche un message d'avertissement
   */
  warning(title: string, message?: string) {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'OK'
    });
  }

  /**
   * Affiche une confirmation
   */
  confirm(title: string, message?: string, confirmText: string = 'Oui', cancelText: string = 'Non') {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f3bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
  }

  /**
   * Affiche un loader
   */
  loading(title: string = 'Chargement...') {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Ferme le loader
   */
  close() {
    Swal.close();
  }
}

