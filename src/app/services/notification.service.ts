import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // ✅ Reactive signal array managing current active toasts
  toasts = signal<ToastMessage[]>([]);
  private nextId = 0;

  /**
   * Dispatches a global toast notification overlay message.
   * @param message Text string to display inside toast banner.
   * @param type Style classification variant ('success' | 'error' | 'info' | 'warning').
   * @param duration Time window before auto-destruct sequence.
   */
  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 4000): void {
    const id = this.nextId++;
    
    // Immutable array mutation using Signals framework updater method
    this.toasts.update(currentToasts => [...currentToasts, { id, message, type }]);

    // Queue clean removal operation automatically matching design duration
    setTimeout(() => {
      this.clear(id);
    }, duration);
  }

  // Pure Shorthand Helper Utility Signatures
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Instantly removes an explicit toast message segment context from the active collection viewport.
   * @param id Target unique operational increment key id.
   */
  clear(id: number): void {
    this.toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
  }
}