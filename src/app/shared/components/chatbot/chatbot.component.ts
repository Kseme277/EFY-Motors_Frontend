import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="chat-app" class="chat-app">
      
      <!-- Bouton flottant pour ouvrir le chat -->
      <div class="chat-app_toggle" (click)="toggleChat()" *ngIf="!isOpen">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" style="width: 32px; height: 32px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      <!-- Fenêtre du chat -->
      <div class="chat-app_box" *ngIf="isOpen">
        <div class="chat-app_header">
          
          <!-- Bouton de fermeture (Croix) -->
          <div class="close-btn" (click)="toggleChat()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="white" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <div class="branding">
            <div class="avatar is-online">
              <div style="width: 48px; height: 48px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 10px rgba(20, 30, 48, 0.2);">
                <img src="assets/images/logo.png" style="width: 36px; height: 36px; object-fit: contain; border-radius: 0; box-shadow: none;">
              </div>
            </div>
            
            <div class="content">
              <p class="title">Conseiller IA EFY</p>
              <p class="subtitle">Posez-moi vos questions</p>
            </div>
            
          </div>
        </div>
        
        <div class="chat-app_content" #scrollMe>
          <div class="messages">
            <ng-container *ngFor="let msg of messages">
              <div class="message" [ngClass]="msg.isBot ? 'reply' : ''">
                <p class="text" style="margin: 0; font-size: 0.95em;">{{msg.text}}</p>
              </div>
            </ng-container>
            
            <div class="message reply" *ngIf="isLoading">
              <p class="text" style="margin: 0;">
                <span class="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="chat-app_footer">
          <form (ngSubmit)="sendMessage()" style="display: flex; gap: 10px; width: 100%;">
            <input class="chat-input" type="text" placeholder="Écrivez votre message..." [(ngModel)]="newMessage" name="newMessage" [disabled]="isLoading" autocomplete="off" />
            <button type="submit" class="submit-btn" [disabled]="!newMessage.trim() || isLoading">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 20px; height: 20px; transform: translateX(1px);">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    *, *:after, *:before { box-sizing: border-box; }
    .chat-app {
      font-family: "Outfit", "Roboto", sans-serif;
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 9999;
      color: #141E30;
    }
    :host-context(.dark) .chat-app {
      color: #f2f4f7;
    }
    .chat-app .title {
      font-size: 1.25em;
      font-weight: 600;
      margin: 0;
    }
    .chat-app .subtitle {
      font-size: 0.9em;
      font-weight: 500;
      margin: 0;
      opacity: 0.9;
    }
    
    @keyframes popIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideUpFade {
      0% { opacity: 0; transform: translateY(20px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Toggle Button */
    .chat-app_toggle {
      position: absolute;
      bottom: 0;
      right: 0;
      height: 64px;
      width: 64px;
      background: #0f3bff;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0, 95, 155, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 20;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transition: transform 0.2s;
    }
    .chat-app_toggle:hover {
      transform: scale(1.1);
    }

    /* Chat Box */
    .chat-app_box {
      border-radius: 16px 16px 40px 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      position: absolute;
      bottom: 0;
      right: 0;
      width: 400px;
      height: 650px;
      display: flex;
      flex-direction: column;
      background: white;
      z-index: 10;
      transform-origin: bottom right;
      animation: slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    :host-context(.dark) .chat-app_box {
      background: #1a1a1a;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    /* Header */
    .chat-app_header {
      background: #0f3bff;
      color: white;
      position: relative;
    }
    .chat-app_header .branding {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 1.5em 1.5em;
    }
    
    /* Close Button */
    .close-btn {
      height: 2.2em;
      width: 2.2em;
      background: rgba(255, 255, 255, 0.15);
      position: absolute;
      top: 1.2em;
      right: 1.2em;
      border-radius: 50%;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .chat-app_header .avatar {
      margin-right: 1em;
      position: relative;
      width: 48px;
      height: 48px;
    }
    .chat-app_header .avatar.is-online:after {
      content: "";
      display: block;
      height: 0.75em;
      width: 0.75em;
      position: absolute;
      bottom: 0.1em;
      right: 0.1em;
      background: #22c55e;
      z-index: 2;
      border-radius: 100%;
      box-shadow: 0 0 0 2px white;
    }
    .chat-app_header .content {
      width: calc(100% - 48px - 1em);
    }
    
    /* Content */
    .chat-app_content {
      height: 100%;
      width: calc(100% - 1em);
      position: relative;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: auto;
      margin: 0 0.5em;
    }
    .chat-app_content::-webkit-scrollbar {
      width: 0.4em;
      background-color: transparent;
    }
    .chat-app_content::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: #ededed;
    }
    :host-context(.dark) .chat-app_content::-webkit-scrollbar-thumb {
      background-color: #3a3a3a;
    }
    .chat-app_content .messages {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 1em;
      position: absolute;
      padding-bottom: 1em;
      width: 100%;
      min-height: 100%;
    }
    .chat-app_content .message {
      width: fit-content;
      max-width: calc(100% - 2em);
      padding: 0.75em 1em;
      background: white;
      margin-top: 0.5em;
      border-radius: 16px;
      margin-left: auto;
      background: #0f3bff;
      color: white;
      position: relative;
      word-break: break-word;
    }
    .chat-app_content .message:after {
      content: "";
      display: block;
      height: 1em;
      width: 1em;
      position: absolute;
      bottom: 0.75em;
      right: -0.6em;
      clip-path: polygon(0 0, 0% 100%, 75% 100%);
      background: #0f3bff;
      transform: skewY(15deg);
    }
    .chat-app_content .message.reply {
      margin-left: 0;
      margin-right: auto;
      background: #ededed;
      color: #141E30;
      transition: background-color 0.3s, color 0.3s;
    }
    :host-context(.dark) .chat-app_content .message.reply {
      background: #2a2a2a;
      color: #f2f4f7;
    }
    .chat-app_content .message.reply:after {
      right: unset;
      left: -0.6em;
      clip-path: polygon(100% 0, 25% 100%, 100% 100%);
      background: #ededed;
      transform: skewY(-15deg);
      transition: background-color 0.3s;
    }
    :host-context(.dark) .chat-app_content .message.reply:after {
      background: #2a2a2a;
    }
    
    /* Footer */
    .chat-app_footer {
      background: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      padding: 1em;
      position: relative;
      transition: background-color 0.3s;
    }
    :host-context(.dark) .chat-app_footer {
      background: #1a1a1a;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    }
    .chat-input {
      height: 2.8em;
      width: 100%;
      border: none;
      background: #ededed;
      border: solid 1px #e0e0e0;
      border-radius: 1000px;
      padding: 0 1em;
      font-size: 0.95em;
      color: #141E30;
      transition: all 0.3s;
    }
    :host-context(.dark) .chat-input {
      background: #2a2a2a;
      border-color: #3a3a3a;
      color: #f2f4f7;
    }
    .chat-input:focus {
      outline: none;
      box-shadow: 0 5px 15px rgba(0, 95, 155, 0.2);
      border-color: #0f3bff;
      background: white;
    }
    :host-context(.dark) .chat-input:focus {
      background: #1f1f1f;
    }
    .submit-btn {
      background: #0f3bff;
      color: white;
      border: none;
      border-radius: 50%;
      width: 2.8em;
      height: 2.8em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      flex-shrink: 0;
      box-shadow: 0 4px 6px rgba(0, 95, 155, 0.2);
    }
    .submit-btn:hover:not(:disabled) {
      background: #004A7A;
      transform: scale(1.05);
    }
    .submit-btn:disabled {
      background: #a0a0a0;
      cursor: not-allowed;
      opacity: 0.5;
      box-shadow: none;
    }
    :host-context(.dark) .submit-btn:disabled {
      background: #4a4a4a;
    }
    
    @media screen and (max-width: 700px) {
      .chat-app {
        bottom: 16px;
        right: 16px;
      }
      .chat-app_toggle {
        height: 54px;
        width: 54px;
      }
      .chat-app_box {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
      }
    }
    
    /* Animations */
    .typing-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 20px;
    }
    .typing-indicator span {
      width: 6px;
      height: 6px;
      background-color: #a0a0a0;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out both;
    }
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  `]
})
export class ChatbotComponent {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  isOpen = false;
  isLoading = false;
  newMessage = '';
  
  messages: ChatMessage[] = [
    {
      text: "Bonjour ! Je suis l'assistant IA d'EFY Motors. Comment puis-je vous aider dans votre recherche de véhicule aujourd'hui ?",
      isBot: true,
      timestamp: new Date()
    }
  ];

  constructor(private apiService: ApiService) {}

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userText = this.newMessage;
    this.messages.push({
      text: userText,
      isBot: false,
      timestamp: new Date()
    });
    
    this.newMessage = '';
    this.isLoading = true;
    
    // Scroll down for the new user message
    setTimeout(() => this.scrollToBottom(), 50);

    this.apiService.askChatbot(userText).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        let botText = "Je n'ai pas compris votre demande.";
        if (response && response.response) {
          botText = response.response; // Utilise le champ 'response' défini par l'API
        } else if (typeof response === 'string') {
          botText = response;
        }
        
        this.messages.push({
          text: botText,
          isBot: true,
          timestamp: new Date()
        });
        
        // Scroll down for the new bot response
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        this.isLoading = false;
        this.messages.push({
          text: "Désolé, je rencontre des difficultés pour joindre nos serveurs. Veuillez réessayer dans un instant.",
          isBot: true,
          timestamp: new Date()
        });
        console.error('Chatbot API error:', err);
        
        // Scroll down for the error message
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }
}
