import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
    component: Register,
});

function Register() {
    return (
        <div className="mx-auto mt-40 flex h-full max-w-sm flex-col items-center gap-8">
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
                        onSubmit={(e) => {
                            e.preventDefault();
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
                            <Input
                                placeholder="you@example.com"
                                id="email"
                                className="h-10 rounded-md border border-border text-sm placeholder:text-muted-foreground"
                                type="email"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </FieldLabel>
                            <Input
                                placeholder="••••••••"
                                id="password"
                                className="h-10 rounded-md border border-border text-sm placeholder:text-muted-foreground"
                                type="password"
                                required
                                minLength={8}
                            />
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
                            <Input
                                placeholder="••••••••"
                                id="confirmPassword"
                                className="h-10 rounded-md border border-border text-sm placeholder:text-muted-foreground"
                                type="password"
                                required
                                minLength={8}
                            />
                        </Field>

                        <Button
                            variant="default"
                            className="h-10 w-full text-sm font-medium"
                            type="submit"
                        >
                            {" "}
                            Create Account
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
