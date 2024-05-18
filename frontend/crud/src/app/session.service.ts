import { Injectable } from '@angular/core';
import { User } from './user';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  user: User|null = null;
  isLoading: boolean = true;

  constructor (
    private apiService: ApiService,
    private router: Router
  ) {
    const username = localStorage.getItem('auth');
    if (username) {
      this.setUser({ username });
    } else {
      this.isLoading = false;
    }
  }

  setUser(user: User|{username: string}, password?: string) {
    if (password) {
      this.isLoading = true;
      const username = user.username;
      this.apiService.verifyUser({ username: username, password }).subscribe((isVerified) => {
        if (isVerified) {
          this.apiService.getUser({ username: username }).subscribe((data) => {
            let redirect = this.router.url;
            if (data) {
              localStorage.setItem('auth', data.username);
              if (redirect === '/' || redirect === '/register') {
                redirect = '/user/0'
              }
            } else {
              localStorage.removeItem('auth');
            }
            this.user = data;
            Swal.fire({
              icon: 'success',
              title: 'Logged In Successfully',
              timer: 1500
            }).then(() => {
              window.location.href = '/chat'
            })
          });
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Invalid Username/Password'
          })
        }
        this.isLoading = false;
      });
    } else {
      this.isLoading = true;
      this.apiService.getUser({ username: user.username }).subscribe((data) => {
        if (data) {
          localStorage.setItem('auth', data.username);
        } else {
          localStorage.removeItem('auth');
        }
        this.user = data;
        this.isLoading = false;
      });
    }
  }

  getUser() {
    return this.user;
  }

  isLoggedIn(): boolean {
    return this.user !== null;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('auth');
  }
}
