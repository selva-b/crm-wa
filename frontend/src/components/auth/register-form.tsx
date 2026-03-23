"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { AuthCard } from "./auth-card";
import { PasswordStrengthIndicator } from "./password-strength-indicator";
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

export function RegisterForm() {
  const [success, setSuccess] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      organizationName: "",
    },
  });

  const registerMutation = useRegister();
  const password = watch("password");

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => setSuccess(true),
    });
  };

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : undefined;

  if (success) {
    return (
      <AuthCard>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address. Please
            check your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="success">
            If you don&apos;t see the email, check your spam folder.
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
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Get started with your WhatsApp CRM platform
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" required>
                First name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...formRegister("firstName")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" required>
                Last name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...formRegister("lastName")}
              />
            </div>
          </div>

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
              {...formRegister("email")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" required>
              Password
            </Label>
            <PasswordInput
              id="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...formRegister("password")}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="organizationName" required>
              Organization name
            </Label>
            <Input
              id="organizationName"
              placeholder="Acme Inc."
              error={errors.organizationName?.message}
              {...formRegister("organizationName")}
            />
          </div>

          <Button
            type="submit"
            loading={registerMutation.isPending}
            className="w-full"
            size="lg"
          >
            Create account
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-[13px] text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </AuthCard>
  );
}
