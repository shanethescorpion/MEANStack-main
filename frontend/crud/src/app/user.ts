import { type Buffer } from 'buffer';

export interface User {
  _id: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: Date|string;
  gender: 'male'|'female';
  civilstatus: 'Single'|'Married'|'Widowed';
  address: string;
  aboutme: string;
  photo: Buffer|string;
  dateonline: Date|string;
}

export interface UserRegister {
  username: string;
  password: string;
  rpass: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: Date|null;
  gender: 'male'|'female';
  civilstatus: 'Single'|'Married'|'Widowed';
  address: string;
  aboutme: string;
  photo: string;
}

export interface UserUpdate {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthday?: Date|null|string;
  gender?: 'male'|'female';
  civilstatus?: 'Single'|'Married'|'Widowed';
  address?: string;
  aboutme?: string;
}

export interface Photo {
  _id?: string;
  file: Buffer|string;
  mimeType: string;
}
