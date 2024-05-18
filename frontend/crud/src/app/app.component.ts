import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { SessionService } from './session.service';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, LoginComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../../node_modules/bootstrap-icons/font/bootstrap-icons.css'],
})
export class AppComponent {

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {
    if (localStorage.getItem('auth') !== null && this.router.url === "/") {
      this.router.navigateByUrl('/chat')
    }
  }

  canActivate() {
    if (this.isAuthenticated() && this.router.url === "/") {
      this.router.navigateByUrl('/chat')
      return false;
    }
    return true;
  }

  isAuthenticated() {
    return !this.isLoading() && this.isLoggedIn()
  }

  isRootPage() {
    return this.router.url === '/'
  }

  isLoading() {
    return this.sessionService.isLoading;
  }

  isLoggedIn() {
    return this.sessionService.isLoggedIn()
  }

}
