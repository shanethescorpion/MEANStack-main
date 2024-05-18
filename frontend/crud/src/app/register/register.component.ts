import { NgIf, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRegister } from '../user';
import { ApiService } from '../api.service';
import { RouterLink } from '@angular/router';
import { Buffer } from 'buffer';
import { SessionService } from '../session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../../../node_modules/bootstrap-icons/font/bootstrap-icons.css']
})
export class RegisterComponent {

  errors: {
    username: boolean;
    password: boolean;
    rpass: boolean;
  } = {
    username: false,
    password: false,
    rpass: false,
  };

  user: UserRegister = {
    username: '',
    password: '',
    rpass: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: null,
    gender: 'male',
    civilstatus: 'Single',
    address: '',
    aboutme: '',
    photo: '',
  };

  uploadphoto: File|null = null;
  uploadphotobuffer: Buffer|null = null;
  tempPhotoUrl: string = "";

  progressbarWidth: number = 0;

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService
  ) {
    if (localStorage.getItem('auth')) {
      this.sessionService.setUser({ username: localStorage.getItem('auth') as string });
    }
  }

  private toArrayBuffer(buffer: Buffer): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }

  private createBlobUrl(buffer: Buffer, mimeType: string) {
    const arrayBuffer = this.toArrayBuffer(buffer);
    const fileBlob = new Blob([new Uint8Array(arrayBuffer)], {
      type: mimeType
    })
    const filepath =  window.URL.createObjectURL(fileBlob)
    return filepath;
  }

  private async fileToBufferWithCompression(file: File): Promise<Buffer|null> {
    return new Promise<Buffer|null>((resolve) => {
        if (file === null) {
          resolve(null);
          return;
        }
        const mimeType = file.type;
        const reader = new FileReader();

        reader.onload = async (event) => {
            if (!event.target || !(event.target.result instanceof ArrayBuffer)) {
                resolve(null);
                return;
            }

            const buffer = Buffer.from(event.target.result);

            try {
                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        resolve(null);
                        return;
                    }

                    const maxWidth = 100; // Adjust as needed
                    const maxHeight = 100; // Adjust as needed
                    let width = image.width;
                    let height = image.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(null);
                            return;
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                            if (!reader.result) {
                                resolve(null);
                                return;
                            }
                            const res = Buffer.from(reader.result as ArrayBuffer)
                            resolve(res);
                        };
                        reader.onerror = () => {
                            resolve(null);
                        };
                        reader.readAsArrayBuffer(blob);
                    }, mimeType);
                };
                image.onerror = () => {
                    resolve(null);
                };
                image.src = URL.createObjectURL(file);
            } catch (error) {
                resolve(null);
            }
        };

        reader.onerror = () => {
            resolve(null);
        };

        reader.readAsArrayBuffer(file);
    });
  }

  resetFields() {
    this.user.photo = '';
    this.uploadphoto = null;
    this.uploadphotobuffer = null;
    this.tempPhotoUrl = "";
    this.user.civilstatus = 'Single';
    this.user.gender = 'male';
    this.errors.username = false;
    this.errors.password = false;
    this.errors.rpass = false;
  }

  async onDisplayProfilePhoto(ev: any) {
    this.uploadphoto = ev.target.files?.[0] || null;
    if (this.uploadphoto !== null) {
      const buffer = await this.fileToBufferWithCompression(this.uploadphoto);
      this.uploadphotobuffer = buffer;
      this.tempPhotoUrl = buffer !== null ? this.createBlobUrl(buffer, this.uploadphoto.type) : "";
    } else {
      this.user.photo = '';
      this.uploadphoto = null;
      this.uploadphotobuffer = null;
      this.tempPhotoUrl = "";
    }
  }

  onUsernameChange() {
    if (this.user.username) {
      this.apiService.getUser({ username: this.user.username }).subscribe((data) => {
        this.errors.username = data !== null;
      })
    }
  }

  onPasswordChange() {
    if (this.user.password) {
      if (this.user.password.length < 4) {
        this.errors.password = true;
      } else {
        this.errors.password = false;
      }
    }
  }

  onRepeatPasswordChange() {
    if (this.user.rpass) {
      if (this.user.rpass !== this.user.password) {
        this.errors.rpass = true;
      } else {
        this.errors.rpass = false;
      }
    }
  }

  onSubmit(ev: any): void {
    const form = ev.target as HTMLFormElement;
    if (Object.values(this.errors).some((v) => !!v)) {
      console.log(this.errors);
      return;
    }
    if (
      [
        this.user.username, this.user.password, this.user.firstName, this.user.lastName,
        this.user.birthday, this.user.gender, this.user.civilstatus
      ].every((v) => !!v)
    ) {
      const thisUser = this.user;
      if (this.uploadphotobuffer && this.uploadphoto) {
        const thisApiService = this.apiService;
        const thisClass = this;
        this.apiService.uploadPhoto({
          file: this.uploadphotobuffer,
          mimeType: this.uploadphoto.type,
        }).subscribe((result) => {
          thisUser.photo = result.insertedId || '';
          thisApiService.addUser(thisUser).subscribe((response) => {
            if (response.status < 206) {
              form.reset();
              thisClass.resetFields();
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Registered Successfully'
              })
            } else {
              console.log("there was an error code:", response.status, " Reason:", response.message);
            }
          });
        })
      } else {
        this.apiService.addUser(thisUser).subscribe((response) => {
          if (response.status < 206) {
            form.reset();
            this.resetFields();
          } else {
            console.log("there was an error code:", response.status, " Reason:", response.message);
          }
        });
      }
    } else {
      console.log("Fill in all fields");
    }
  }
}
