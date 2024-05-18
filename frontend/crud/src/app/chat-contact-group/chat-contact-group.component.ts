import { NgIf, NgOptimizedImage } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-chat-contact-group',
  standalone: true,
  imports: [NgOptimizedImage, NgIf],
  templateUrl: './chat-contact-group.component.html',
  styleUrl: './chat-contact-group.component.css'
})
export class ChatContactGroupComponent {
  @Input() data: any[] = []
  @Input() selectedContactIndex: number = -1;
  @Output() select = new EventEmitter()
  @Output() refresh = new EventEmitter()
  time = new Date();

  constructor(
    private apiService: ApiService
  ) {
    this.refresh.emit();
    this.time = new Date();
    setTimeout(() => {
      this.refresh.emit();
      this.time = new Date();
    }, 1000);
    setInterval(() => {
      this.refresh.emit();
      this.time = new Date();
    }, 5000);
  }

  getPhotoPath(uid: string) {
    return uid ? `${this.apiService.apiUrl}/photos/${uid}` : '/assets/photo-default.jpg';
  }

  formatDate(d: Date|string): string {
    const datePast = new Date(d);
    const seconds = Math.floor((new Date().getTime() - datePast.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return 'just now';
    } else if (minutes < 60) {
        return minutes + 'm';
    } else if (hours < 24) {
        return hours + 'h';
    } else if (days < 30) {
        return days + 'd';
    } else if (months < 12) {
        return months + 'M';
    } else {
        return years + 'y';
    }
  }

  handleClick(index: number) {
    this.select.emit(index)
    this.refresh.emit();
    this.time = new Date();
  }

}
