"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { AuthCard } from "./auth-card";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const login = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : undefined;
  const showResend =
    errorMessage && errorMessage.toLowerCase().includes("verify");

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <Alert variant="error">
              {errorMessage}
              {showResend && (
                <>
                  {" "}
                  <Link
                    href="/auth/register"
                    className="font-medium text-error underline underline-offset-2"
                  >
                    Resend verification email
                  </Link>
                </>
              )}
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-[13px] text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <Button
            type="submit"
            loading={login.isPending}
            className="w-full"
            size="lg"
          >
            Sign in
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-[13px] text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </AuthCard>
  );
}
