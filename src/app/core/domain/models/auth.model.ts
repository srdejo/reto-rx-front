export type Role = 'ADMIN' | 'USER';

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface AuthSession {
  token: string;
  role: Role;
  personId: number;
}
