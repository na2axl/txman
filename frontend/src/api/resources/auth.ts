export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResource {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface CurrentUserResource {
  id: string;
  username: string;
}
