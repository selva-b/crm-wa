"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { useForgotPassword } from "@/hooks/use-auth";
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
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPassword = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword.mutate(data, {
      onSuccess: () => setSuccess(true),
    });
  };

  const errorMessage =
    forgotPassword.error instanceof ApiError
      ? forgotPassword.error.message
      : undefined;

  if (success) {
    return (
      <AuthCard>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account with that email exists, we&apos;ve sent a password
            reset link. Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info">
            The link will expire in 1 hour. If you don&apos;t see the email,
            check your spam folder.
          </Alert>
        </CardContent>
        <CardFooter>
          <Link
            href="/auth/login"
            className="text-[13px] text-primary hover:underline"
          >
            Back to login
          </Link>
        </CardFooter>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

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

          <Button
            type="submit"
            loading={forgotPassword.isPending}
            className="w-full"
            size="lg"
          >
            Send reset link
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <Link
          href="/auth/login"
          className="text-[13px] text-primary hover:underline"
        >
          Back to login
        </Link>
      </CardFooter>
    </AuthCard>
  );
}
