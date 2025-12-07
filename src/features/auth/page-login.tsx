import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authClient } from '@/features/auth/client'

export function PageLogin({ search }: { search: { redirect?: string } }) {
  const login = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.email({
        email: 'admin@admin.com',
        password: 'admin',
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
      <Button onClick={() => login.mutate()}>Connexion</Button>
    </div>
  )
}
