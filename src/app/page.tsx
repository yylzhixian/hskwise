import { GoogleLoginButton } from '@/components/google-login-button'
import { api } from '@/lib/eden'

export default async function Page() {
  const { data } = await api.db.get()

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <section className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">HSKWise</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            Sign in to continue learning.
          </h1>
        </div>

        <GoogleLoginButton />

        <p className="text-sm text-muted-foreground">
          API: {data?.status ?? 'unknown'} / {data?.orm ?? 'unknown'}
        </p>
      </section>
    </main>
  )
}
