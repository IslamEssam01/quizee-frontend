import { InputField } from "@/components/inputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPasswordMutation } from "@/hooks/useForgotPasswordMutation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_auth/forgot-password")({
    component: RouteComponent,
});

function RouteComponent() {
    const [email, setEmail] = useState("");

    const forgotPasswordMutation = useForgotPasswordMutation();

    const isDisabled = forgotPasswordMutation.isPending;
    return (
        <>
            <div className="flex w-full justify-start">
                <Link
                    to="/login"
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary-foreground"
                >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
            </div>
            <div className="flex w-full flex-col justify-start">
                <h1 className="text-2xl font-semibold text-foreground">
                    Reset password
                </h1>
                <span className="text-sm text-muted-foreground">
                    Enter your email and we will send you a reset link
                </span>
            </div>
            <Card className="w-full">
                <CardContent>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            forgotPasswordMutation.mutate({ email });
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
                        <Button
                            variant="default"
                            className="h-10 w-full text-sm font-medium"
                            type="submit"
                            disabled={isDisabled}
                        >
                            Send reset link
                            {isDisabled && <Spinner data-icon="inline-end" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
