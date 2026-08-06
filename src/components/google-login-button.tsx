'use client'

import Script from 'next/script'

import {
  googleCredentialCallbackName,
  useGoogleCredentialCallback,
} from '@/hooks/use-google-credential-callback'
import type {
  GoogleLoginUxMode,
  GoogleSignInButtonShape,
  GoogleSignInButtonSize,
  GoogleSignInButtonText,
  GoogleSignInButtonTheme,
  GoogleSignInButtonType,
} from '@/types/google-identity'

export type GoogleLoginButtonProps = {
  locale?: string
}

type GoogleLoginConfig = {
  clientId: string | undefined
  autoPrompt: boolean
  uxMode: GoogleLoginUxMode
  button: {
    type: GoogleSignInButtonType
    theme: GoogleSignInButtonTheme
    size: GoogleSignInButtonSize
    text: GoogleSignInButtonText
    shape: GoogleSignInButtonShape
    width: number
  }
}

const googleLoginConfig: GoogleLoginConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  autoPrompt: true,
  uxMode: 'popup',
  button: {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'circle',
    width: 320,
  },
}

export function GoogleLoginButton({ locale }: GoogleLoginButtonProps) {
  useGoogleCredentialCallback()

  if (!googleLoginConfig.clientId) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Google client id is missing.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <div
        id="g_id_onload"
        data-client_id={googleLoginConfig.clientId}
        data-callback={googleCredentialCallbackName}
        data-auto_prompt={googleLoginConfig.autoPrompt ? 'true' : 'false'}
        data-ux_mode={googleLoginConfig.uxMode}
      />

      <div
        className="g_id_signin"
        data-type={googleLoginConfig.button.type}
        data-theme={googleLoginConfig.button.theme}
        data-size={googleLoginConfig.button.size}
        data-text={googleLoginConfig.button.text}
        data-shape={googleLoginConfig.button.shape}
        data-logo_alignment="left"
        data-width={googleLoginConfig.button.width}
        data-locale={locale}
      />
    </div>
  )
}
