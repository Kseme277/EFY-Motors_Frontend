# Configuration EmailJS pour l'envoi d'emails

## Étapes de configuration

1. **Créer un compte EmailJS** (gratuit) : https://www.emailjs.com/

2. **Créer un service email** :
   - Aller dans "Email Services"
   - Choisir un fournisseur (Gmail, Outlook, etc.)
   - Connecter votre compte email
   - Noter le **Service ID**

3. **Créer un template email** :
   - Aller dans "Email Templates"
   - Créer un nouveau template
   - Utiliser ces variables dans le template :
     - `{{from_name}}` - Nom de l'expéditeur
     - `{{from_email}}` - Email de l'expéditeur
     - `{{subject}}` - Sujet du message
     - `{{message}}` - Contenu du message
     - `{{to_email}}` - Email du destinataire (kseme@gmail.com)
   - Noter le **Template ID**

4. **Récupérer la Public Key** :
   - Aller dans "Account" > "General"
   - Copier la **Public Key**

5. **Configurer dans le code** :
   - Ouvrir `src/app/features/contact/contact.component.ts`
   - Remplacer :
     - `YOUR_SERVICE_ID` par ton Service ID
     - `YOUR_TEMPLATE_ID` par ton Template ID
     - `YOUR_PUBLIC_KEY` par ta Public Key

## Exemple de template EmailJS

```
Sujet: {{subject}}

Message de {{from_name}} ({{from_email}}):

{{message}}

---
Ce message a été envoyé depuis le formulaire de contact EFY Motors.
```

