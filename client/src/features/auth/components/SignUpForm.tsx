import { useWatch, Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { signUpSchema, type SignUpInput } from '../schema';
import { useSignUp } from '../hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { SocialButtons } from './SocialButtons';
import { getErrorMessage } from '@/lib/api/error-message';

const labelClass = 'text-[12px] font-semibold text-muted-foreground'

type PasswordStrength = 'weak' | 'good' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length >= 10) return 'strong';
  if (password.length >= 6) return 'good';
  return 'weak';
}

const STRENGTH_BARS: Record<PasswordStrength, number> = { weak: 1, good: 2, strong: 3 };
const STRENGTH_TONE: Record<PasswordStrength, { bar: string; text: string }> = {
  weak: { bar: 'bg-danger', text: 'text-danger' },
  good: { bar: 'bg-warning', text: 'text-warning' },
  strong: { bar: 'bg-success', text: 'text-success' },
};
const STRENGTH_LABEL: Record<PasswordStrength, string> = { weak: 'Weak', good: 'Good', strong: 'Strong' };

function PasswordStrengthMeter({ password }: { readonly password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  const bars = STRENGTH_BARS[strength];
  const tone = STRENGTH_TONE[strength];

  return (
    <div className="-mt-2 mb-3.5 flex items-center gap-1">
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={`h-0.75 flex-1 rounded-full transition-colors duration-200 ${
            bar <= bars ? tone.bar : 'bg-border'
          }`}
        />
      ))}
      <span className={`ml-1.5 text-[11px] font-semibold ${tone.text}`}>
        {STRENGTH_LABEL[strength]}
      </span>
    </div>
  );
}

export function SignUpForm() {
  const { mutate: signUp, isPending, error } = useSignUp()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' },
  })

  const password = useWatch({ control, name: 'password' })

  return (
    <form onSubmit={handleSubmit((data) => signUp(data))} className="space-y-3.5">
      <SocialButtons />

      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or sign up with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field data-invalid={!!errors.firstName}>
          <FieldLabel htmlFor="firstName" className={labelClass}>First name</FieldLabel>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input id="firstName" placeholder="Alex" autoComplete="given-name" {...field} />
            )}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field data-invalid={!!errors.lastName}>
          <FieldLabel htmlFor="lastName" className={labelClass}>Last name</FieldLabel>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input id="lastName" placeholder="Chen" autoComplete="family-name" {...field} />
            )}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>
      </div>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email" className={labelClass}>Work Email</FieldLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input id="email" type="email" placeholder="alex@example.com" autoComplete="email" {...field} />
          )}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={!!errors.phoneNumber}>
        <FieldLabel htmlFor="phoneNumber" className={labelClass}>Phone number</FieldLabel>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <Input id="phoneNumber" type="tel" placeholder="+21612345678" autoComplete="tel" {...field} />
          )}
        />
        <FieldError errors={[errors.phoneNumber]} />
      </Field>

      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor="password" className={labelClass}>Password</FieldLabel>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input id="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" {...field} />
          )}
        />
        <PasswordStrengthMeter password={password} />
        <FieldError errors={[errors.password]} />
      </Field>

      <Field data-invalid={!!errors.confirmPassword}>
        <FieldLabel htmlFor="confirmPassword" className={labelClass}>Confirm password</FieldLabel>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input id="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
          )}
        />
        <FieldError errors={[errors.confirmPassword]} />
      </Field>

      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
          {getErrorMessage(error, 'Sign up failed. Please try again.')}
        </p>
      )}

      <Button type="submit" className="w-full rounded-lg text-sm font-bold" disabled={isPending}>
        {isPending ? 'Creating account…' : 'Create free account'}
      </Button>

      <p className="text-center text-[11.5px] text-muted-foreground">
        By signing up, you agree to our{' '}
        <a href="/terms" className="cursor-pointer text-primary">Terms</a>
        {' '}and{' '}
        <a href="/privacy-policy" className="cursor-pointer text-primary">Privacy Policy</a>.
      </p>

      <p className="mt-4 text-center text-[13px] text-muted-foreground">
        Already have an account?{' '}
        <Link to="/sign-in" className="font-bold text-primary">Sign in</Link>
      </p>
    </form>
  )
}