import { NgIf, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from '../session.service';
import { User, UserUpdate } from '../user';
import { FormsModule } from '@angular/forms';
import { ChatContactGroupComponent } from '../chat-contact-group/chat-contact-group.component';
import { ApiService } from '../api.service';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';
import { SuccessResponse } from '../responses';
import { ChatboxComponent } from '../chatbox/chatbox.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatboxComponent, NgOptimizedImage, FormsModule, ChatContactGroupComponent, NgIf],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css',  '../../../node_modules/bootstrap-icons/font/bootstrap-icons.css', '../../../node_modules/bootstrap/dist/css/bootstrap.css']
})
export class ChatComponent {
  user: User|null = null;
  userContacts: any[] = [];
  selectedContactIndex: number = -1;
  apiUrl: string = '';
  updateUser: UserUpdate = {};
  showModal: boolean = false;
  chatconversation: any = [];
  chatuser: any = {};

  constructor(
    private sessionService: SessionService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.apiUrl = this.apiService.apiUrl;
    this.user = this.sessionService.getUser();
    this.updateUser = {
      firstName: this.user?.firstName,
      middleName: this.user?.middleName,
      lastName: this.user?.lastName,
      gender: this.user?.gender,
      civilstatus: this.user?.civilstatus,
      birthday: this.user?.birthday,
      address: this.user?.address,
      aboutme: this.user?.aboutme
    }
    this.getChatData();
    setInterval(() => {
      this.refreshChatConversation()
    }, 500);
  }

  getChatData() {
    if (!this.user) {
      this.router.navigateByUrl('/');
      return;
    }
    this.apiService.getAllUsers().subscribe(async (users) => {
      this.apiService.getChatIds(this.user?._id || '').subscribe(async (response) => {
        if (response.status < 206) {
          const data = (response as SuccessResponse<any>).data.filter((item: any) => item.a === this.user!._id || item.b === this.user!._id);
          this.userContacts = users.filter((item: User) => item._id !== this.user!._id).map((user) => {
            const val = data.find((item: any) => item.a === user._id || item.b === user._id);
            if (val) {
              return {...val, chatid: val._id, time: new Date(val.updatedAt), aboutme: user!.aboutme, address: user!.address, name: user!.firstName + ' ' + user!.lastName, userid: user._id, username: user.username, photo: user!.photo, profilephoto: user!.photo, dateonline: user!.dateonline, isonline: (new Date(user!.dateonline)).getTime() + (1000 * 60 * 10) > Date.now() };
            }
            return { aboutme: user!.aboutme, address: user!.address, name: user!.firstName + ' ' + user!.lastName, userid: user._id, username: user.username, photo: user!.photo, profilephoto: user!.photo, dateonline: user!.dateonline, isonline: (new Date(user!.dateonline)).getTime() + (1000 * 60 * 10) > Date.now() };;
          })
          this.setChatContactGroupData();
        }
      })
    });

  }

  setChatContactGroupData() {
    console.log(this.userContacts);
    if (this.selectedContactIndex === -1 && this.userContacts.length > 0) {
      this.handleSelectChatContact(0);
    }
  }

  handleSelectChatContact(index: number) {
    if (this.selectedContactIndex !== index) {
      this.selectedContactIndex = index
      if (index > -1) {
        this.chatuser = this.userContacts[index];
        this.refreshChatConversation()
      } else {
        this.chatuser = null;
      }
    }
  }

  refreshChatConversation() {
    if (this.selectedContactIndex > -1) {
      this.apiService.getChatConversations(this.user!._id, this.chatuser!.userid).subscribe((response) => {
        if (response.status < 206) {
          this.userContacts[this.selectedContactIndex].conversation = (response as SuccessResponse<any>).data || [];
          this.chatuser = this.userContacts[this.selectedContactIndex];
        }
      })
    }
  }

  showUpdateModal() {
    this.updateUser = {
      firstName: this.user?.firstName,
      middleName: this.user?.middleName,
      lastName: this.user?.lastName,
      gender: this.user?.gender,
      civilstatus: this.user?.civilstatus,
      birthday: this.user?.birthday,
      address: this.user?.address,
      aboutme: this.user?.aboutme
    }
    this.showModal = true;
  }

  closeUpdateModal() {
    this.showModal = false;
  }

  onSubmitUpdate() {
    if (
      [
        this.updateUser.firstName, this.updateUser.lastName,
        this.updateUser.birthday, this.updateUser.gender, this.updateUser.civilstatus
      ].every((v) => !!v)
    ) {
      // update
      this.apiService.updateUser({ username: this.user?.username }, this.updateUser).subscribe((response) => {
        if (response.status < 206) {
          // success
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message
          })
          this.sessionService.user = {...this.sessionService.user, ...(response as SuccessResponse<User>).data};
          this.user = this.sessionService.getUser();
          this.closeUpdateModal();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Update',
            text: response.message
          })
          this.closeUpdateModal()
        }
      });
    }
  }

  onLogout() {
    this.sessionService.logout();
    this.router.navigateByUrl('/');
  }
}
