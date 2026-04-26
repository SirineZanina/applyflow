import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { signInSchema, type SignInInput } from '../schema';
import { useSignIn } from '../hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { SocialButtons } from './SocialButtons';
import { getErrorMessage } from '@/lib/api/error-message';

const labelClass = 'text-[12px] font-semibold text-muted-foreground';

export function SignInForm() {
  const { mutate: signIn, isPending, error } = useSignIn()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form onSubmit={handleSubmit((data) => signIn(data))} className="space-y-3.5">
      <SocialButtons />

      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email" className={labelClass}>Email</FieldLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input id="email" type="email" placeholder="alex@example.com" autoComplete="email" {...field} />
          )}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor="password" className={labelClass}>Password</FieldLabel>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
          )}
        />
        <FieldError errors={[errors.password]} />
      </Field>

      <div className="-mt-1 text-right">
        <Button
          variant="ghost"
          onClick={() => toast.info('Password reset coming soon.')}
          className="h-auto p-0 text-[12px] font-semibold text-primary hover:bg-transparent"
        >
          Forgot password?
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
          {getErrorMessage(error, 'Sign in failed. Please try again.')}
        </p>
      )}

      <Button type="submit" className="w-full rounded-lg text-sm font-bold" disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/sign-up" className="font-bold text-primary">Sign up free</Link>
      </p>
    </form>
  )
}
