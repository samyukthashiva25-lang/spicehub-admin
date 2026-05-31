import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Add these imports
import { NotificationService } from './services/notification.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,     // Allows <router-outlet> to render pages
    RouterLink,       // Allows routerLink="..." to change pages on click
    RouterLinkActive,
    CommonModule,   // ✅ Added here to fix the NG8002 compile error
    RouterOutlet  // Allows routerLinkActive="active" to style your active tab
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'spicehub-admin';
  constructor(public notify: NotificationService,public loading: LoadingService)
   {}
}


