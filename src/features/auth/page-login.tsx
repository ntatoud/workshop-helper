import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { authClient } from '@/features/auth/client'
import { env } from '@/env'

export function PageLogin({ search }: { search: { redirect?: string } }) {
  const createAdmin = useMutation({
    mutationFn: async () => {
      if (!import.meta.env.DEV) return

      const { data, error } = await authClient.signUp.email({
        email: env.VITE_ADMIN_EMAIL,
        password: env.VITE_ADMIN_PASSWORD,
        name: env.VITE_ADMIN_USERNAME,
        callbackURL: search.redirect ?? '/manager',
      })

      if (error) {
        console.error(error)
        throw new Error(error.code)
      }

      return data
    },
    onSuccess: () => {
      toast.success('Connected')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const login = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.email({
        email: env.VITE_ADMIN_EMAIL,
        password: env.VITE_ADMIN_PASSWORD,
        callbackURL: search.redirect ?? '/manager',
      })

      if (error) {
        console.error(error)
        throw new Error(error.code)
      }

      return data
    },
    onSuccess: () => {
      toast.success('Connected')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return (
    <div>
      {import.meta.env.DEV && (
        <Button onClick={() => createAdmin.mutate()}>Create admin</Button>
      )}
      <Button onClick={() => login.mutate()}>Connexion</Button>
    </div>
  )
}
