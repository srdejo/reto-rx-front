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
  /** Email used to sign in (the login endpoint does not return it). */
  email?: string;
}
