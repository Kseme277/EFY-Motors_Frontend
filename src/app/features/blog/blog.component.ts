import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent {
  blogPosts = [
    { id: 1, title: 'Pourquoi la Génération de Leads est Clé pour la Croissance de l\'Entreprise', date: '29 oct. 2019', excerpt: 'Une petite rivière nommée Duden coule près de leur lieu et l\'approvisionne en regelialia nécessaire. C\'est un pays paradisiaque, dans lequel des parties rôties de phrases volent dans votre bouche.', image: 'assets/images/image_1.jpg' },
    { id: 2, title: 'Pourquoi la Génération de Leads est Clé pour la Croissance de l\'Entreprise', date: '29 oct. 2019', excerpt: 'Une petite rivière nommée Duden coule près de leur lieu et l\'approvisionne en regelialia nécessaire. C\'est un pays paradisiaque, dans lequel des parties rôties de phrases volent dans votre bouche.', image: 'assets/images/image_2.jpg' },
    { id: 3, title: 'Pourquoi la Génération de Leads est Clé pour la Croissance de l\'Entreprise', date: '29 oct. 2019', excerpt: 'Une petite rivière nommée Duden coule près de leur lieu et l\'approvisionne en regelialia nécessaire. C\'est un pays paradisiaque, dans lequel des parties rôties de phrases volent dans votre bouche.', image: 'assets/images/image_3.jpg' },
    { id: 4, title: 'Pourquoi la Génération de Leads est Clé pour la Croissance de l\'Entreprise', date: '29 oct. 2019', excerpt: 'Une petite rivière nommée Duden coule près de leur lieu et l\'approvisionne en regelialia nécessaire. C\'est un pays paradisiaque, dans lequel des parties rôties de phrases volent dans votre bouche.', image: 'assets/images/image_4.jpg' },
    { id: 5, title: 'Pourquoi la Génération de Leads est Clé pour la Croissance de l\'Entreprise', date: '29 oct. 2019', excerpt: 'Une petite rivière nommée Duden coule près de leur lieu et l\'approvisionne en regelialia nécessaire. C\'est un pays paradisiaque, dans lequel des parties rôties de phrases volent dans votre bouche.', image: 'assets/images/image_5.jpg' },
    { id: 6, title: 'Pourquoi la Génération de Leads est Clé pour la Croissance de l\'Entreprise', date: '29 oct. 2019', excerpt: 'Une petite rivière nommée Duden coule près de leur lieu et l\'approvisionne en regelialia nécessaire. C\'est un pays paradisiaque, dans lequel des parties rôties de phrases volent dans votre bouche.', image: 'assets/images/image_6.jpg' }
  ];
}
