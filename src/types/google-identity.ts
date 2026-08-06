export type GoogleCredentialSelectBy =
  | 'auto'
  | 'user'
  | 'user_1tap'
  | 'user_2tap'
  | 'btn'
  | 'btn_confirm'
  | 'btn_add_session'
  | 'btn_confirm_add_session'
  | 'fedcm'

export type GoogleCredentialResponse = {
  credential: string
  select_by?: GoogleCredentialSelectBy
  clientId?: string
}

export type GoogleCredentialPayload = {
  iss?: string
  azp?: string
  aud?: string
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
  iat?: number
  exp?: number
  jti?: string
  [claim: string]: unknown
}

export type GoogleCredentialCallback = (
  response: GoogleCredentialResponse
) => void

export type GoogleLoginUxMode = 'popup' | 'redirect'

export type GoogleSignInButtonType = 'standard' | 'icon'
export type GoogleSignInButtonTheme = 'outline' | 'filled_blue' | 'filled_black'
export type GoogleSignInButtonSize = 'large' | 'medium' | 'small'
export type GoogleSignInButtonText =
  | 'signin_with'
  | 'signup_with'
  | 'continue_with'
  | 'signin'
export type GoogleSignInButtonShape =
  | 'rectangular'
  | 'pill'
  | 'circle'
  | 'square'
