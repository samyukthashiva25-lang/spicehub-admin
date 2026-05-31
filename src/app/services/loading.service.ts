import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // A simple counter to track concurrent background API operations
  private activeRequests = signal<number>(0);

  // Computed state exposed publicly to templates
  isLoading = () => this.activeRequests() > 0;

  show(): void {
    this.activeRequests.update(count => count + 1);
  }

  hide(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }
}