import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  user: {
    username: string;
    password: string;
  } = {
    username: '',
    password: ''
  };

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  isLoggedIn() {
    return this.sessionService.isLoggedIn()
  }

  onSubmit(): void {
    this.sessionService.setUser({ username: this.user.username }, this.user.password);
  }
}

