import { Outlet, useRouterState } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthLayoutProps {
  title: string;
  description: string;
}

function AuthCard({ title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
}

export function SignInLayout() {
  return <AuthCard title="Sign in" description="Enter your credentials to continue" />;
}

export function SignUpLayout() {
  return <AuthCard title="Create account" description="Fill in your details to get started" />;
}

export function AuthLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname.includes("sign-up") ? <SignUpLayout /> : <SignInLayout />;
}
