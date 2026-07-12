import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCreateUserMutation } from "@/hooks/useCreateUserMutation";
import { cn, errorToast } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/register")({
    component: Register,
});

function InputField({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"input">) {
    return (
        <Input
            className={cn(
                "h-10 rounded-md border border-border  text-sm transition-all placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:duration-300 focus-visible:outline-none",
                className,
            )}
            {...props}
        />
    );
}

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const PasswordFieldIcon = showPassword ? EyeOff : Eye;
    const ConfirmPasswordFieldIcon = showConfirmPassword ? EyeOff : Eye;

    const createUserMutation = useCreateUserMutation();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const isDisabled = createUserMutation.isPending;

    return (
        <div className="mx-auto flex max-w-sm flex-col items-center gap-8 pt-40">
            <div className="flex w-full flex-col justify-start">
                <h1 className="text-2xl font-semibold text-foreground">
                    Create account
                </h1>
                <span className="text-sm text-muted-foreground">
                    Get started with Quizee
                </span>
            </div>
            <Card className="w-full">
                <CardContent>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (password !== confirmPassword) {
                                errorToast("Passwords do not match");
                                return;
                            }
                            createUserMutation.mutate(
                                {
                                    username,
                                    email,
                                    password,
                                },
                                {
                                    onSuccess: () => {
                                        navigate({ to: "/login" });
                                    },
                                },
                            );
                        }}
                        className="flex flex-col gap-4"
                    >
                        <Field>
                            <FieldLabel
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                Email
                            </FieldLabel>
                            <InputField
                                placeholder="you@example.com"
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isDisabled}
                            />
                        </Field>
                        <Field>
                            <FieldLabel
                                htmlFor="username"
                                className="text-sm font-medium"
                            >
                                Username
                            </FieldLabel>
                            <InputField
                                placeholder="Username"
                                id="username"
                                type="text"
                                required
                                autoComplete="username"
                                maxLength={50}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isDisabled}
                            />
                            <span className="text-xs text-muted-foreground">
                                Maximum 50 characters
                            </span>
                        </Field>
                        <Field>
                            <FieldLabel
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </FieldLabel>
                            <div className="relative">
                                <InputField
                                    placeholder="••••••••"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={isDisabled}
                                />
                                <PasswordFieldIcon
                                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setShowPassword((prev) => !prev);
                                    }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Minimum 8 characters
                            </span>
                        </Field>
                        <Field>
                            <FieldLabel
                                htmlFor="confirmPassword"
                                className="text-sm font-medium"
                            >
                                Confirm Password
                            </FieldLabel>
                            <div className="relative">
                                <InputField
                                    placeholder="••••••••"
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    disabled={isDisabled}
                                />
                                <ConfirmPasswordFieldIcon
                                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setShowConfirmPassword((prev) => !prev);
                                    }}
                                />
                            </div>
                        </Field>

                        <Button
                            variant="default"
                            className="h-10 w-full text-sm font-medium"
                            type="submit"
                            disabled={isDisabled}
                        >
                            Create Account
                            {isDisabled && <Spinner data-icon="inline-end" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <div className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-base font-medium text-primary underline-offset-2 hover:underline"
                    >
                        Sign in
                    </Link>
                </span>
            </div>
        </div>
    );
}
