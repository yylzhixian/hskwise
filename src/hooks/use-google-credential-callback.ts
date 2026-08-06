'use client'

import type {
  GoogleCredentialPayload,
  GoogleCredentialResponse,
} from '@/types/google-identity'
import { useEffect } from 'react'

export const googleCredentialCallbackName = 'handleGoogleCredentialResponse'

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  )

  return decodeURIComponent(
    atob(paddedBase64)
      .split('')
      .map((character) => {
        return `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`
      })
      .join('')
  )
}

export function decodeGoogleCredential(token: string): GoogleCredentialPayload {
  const payload = token.split('.')[1]

  if (!payload) {
    throw new Error('Invalid Google credential token.')
  }

  return JSON.parse(decodeBase64Url(payload)) as GoogleCredentialPayload
}

function handleGoogleCredentialResponse(response: GoogleCredentialResponse) {
  console.log(`Encoded JWT ID token: ${response.credential}`)

  const responsePayload = decodeGoogleCredential(response.credential)

  console.log('Decoded JWT ID token fields:')
  console.log(`  Full Name: ${responsePayload.name ?? ''}`)
  console.log(`  Given Name: ${responsePayload.given_name ?? ''}`)
  console.log(`  Family Name: ${responsePayload.family_name ?? ''}`)
  console.log(`  Unique ID: ${responsePayload.sub}`)
  console.log(`  Profile image URL: ${responsePayload.picture ?? ''}`)
  console.log(`  Email: ${responsePayload.email ?? ''}`)
}

export function useGoogleCredentialCallback() {
  useEffect(() => {
    window.handleGoogleCredentialResponse = handleGoogleCredentialResponse

    return () => {
      delete window.handleGoogleCredentialResponse
    }
  }, [])
}
