import { InputField } from "@/components/inputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
    component: Register,
});

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const PasswordFieldIcon = showPassword ? EyeOff : Eye;
    const loginMutation = useLoginMutation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const isDisabled = loginMutation.isPending;

    return (
        <div className="mx-auto flex max-w-sm flex-col items-center gap-8 pt-40">
            <div className="flex w-full flex-col justify-start">
                <h1 className="text-2xl font-semibold text-foreground">
                    Sign in
                </h1>
                <span className="text-sm text-muted-foreground">
                    Welcome back to Quizee
                </span>
            </div>
            <Card className="w-full">
                <CardContent>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            loginMutation.mutate(
                                {
                                    email,
                                    password,
                                },
                                {
                                    onSuccess: () => {
                                        navigate({ to: "/" });
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
                                    autoComplete="current-password"
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
                        </Field>
                        <Button
                            variant="default"
                            className="h-10 w-full text-sm font-medium"
                            type="submit"
                            disabled={isDisabled}
                        >
                            Sign in
                            {isDisabled && <Spinner data-icon="inline-end" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <div className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-base font-medium text-primary underline-offset-2 hover:underline"
                    >
                        Sign up
                    </Link>
                </span>
            </div>
        </div>
    );
}
