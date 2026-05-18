export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthResponse {
  access_token: string
  token_type: string
}
