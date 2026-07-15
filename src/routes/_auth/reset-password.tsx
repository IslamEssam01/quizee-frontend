import { InputField } from "@/components/inputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useResetPasswordMutation } from "@/hooks/useResetPasswordMutation";
import { errorToast } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const resetPasswordSearchSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export const Route = createFileRoute("/_auth/reset-password")({
    component: RouteComponent,
    validateSearch: resetPasswordSearchSchema,
    // TODO: add errorComponent
});

function RouteComponent() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const PasswordFieldIcon = showPassword ? EyeOff : Eye;
    const ConfirmPasswordFieldIcon = showConfirmPassword ? EyeOff : Eye;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { token } = Route.useSearch();

    const navigate = useNavigate();

    const resetPasswordMutation = useResetPasswordMutation();

    const isDisabled = resetPasswordMutation.isPending;
    return (
        <>
            <div className="flex w-full flex-col justify-start">
                <h1 className="text-2xl font-semibold text-foreground">
                    Set new password
                </h1>
                <span className="text-sm text-muted-foreground">
                    Choose a new password for your account
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
                            resetPasswordMutation.mutate(
                                { token, new_password: password },
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
                                Confirm new password
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
                            Update password
                            {isDisabled && <Spinner data-icon="inline-end" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
