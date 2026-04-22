import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { signInSchema, type SignInInput } from '../schema';
import { useSignIn } from '../hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignInForm() {
    const { mutate: signIn, isPending, error } = useSignIn()
    const { control, handleSubmit, formState: { errors }} = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: '', password: ''}
    })

    return (
        <form onSubmit={handleSubmit((data) => signIn(data))} className='space-y-4'>
            <div className='space-y-1'>
                <Label htmlFor='email'>Email</Label>
                <Controller
                    name='email'
                    control={control}
                    render={({ field }) => 
                        <Input id='email' type='email' placeholder='you@example.com' {...field} />
                    }
                />
                {errors.email && <p className='text-sm text-destructive'>{errors.email.message}</p> }
            </div>
            <div className='space-y-1'>
                <Label htmlFor='password'>Password</Label>
                <Controller
                    name='password'
                    control={control}
                    render={({ field }) => <Input id='password' type='password' placeholder='••••••••' {...field} />}
                />
                {errors.password && <p className='text-sm text-destructive'>{errors.password.message}</p> }
            </div>

            {error && <p className='text-sm text-destructive'>{error.message}</p> }
            
            <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? 'Signing in…' : 'Sign in'}
            </Button>

            <p className='text-center text-sm text-muted-foreground'>
                Don't have an account?{' '}
                <Link to='/sign-up' className='text-primary underline-offset-4 hover:underline'>
                    Sign up
                </Link>
            </p>
        </form>
    )
}