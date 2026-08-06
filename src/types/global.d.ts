import type { GoogleCredentialCallback } from './google-identity'

declare global {
  interface Window {
    handleGoogleCredentialResponse?: GoogleCredentialCallback
  }
}
