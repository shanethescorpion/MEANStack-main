import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  {
    path: 'register',
    title: "Sign Up | E-Messenger",
    component: RegisterComponent
  },
  {
    path: 'chat',
    title: "E-Messenger User",
    component: ChatComponent
  }
];
