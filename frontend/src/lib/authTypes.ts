export interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

export interface AuthSession {
  access_token: string
  token_type: 'bearer'
  user: AuthUser
}
