import { Button } from "@/components/ui/button";
import {
    currentUserQueryOptions,
    useCurrentUser,
} from "@/hooks/useCurrentUser";
import { queryClient } from "@/lib/queryClient";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { InputField } from "@/components/inputField";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateUserMutation } from "@/hooks/useUpdateUserMutation";
import { errorToast } from "@/lib/utils";
import { useChangePasswordMutation } from "@/hooks/useChangePasswordMutation";
import { useDeleteUserMutation } from "@/hooks/useDeleteUserMutation";
import { ConfirmDialog } from "@/components/confirmDialog";

export const Route = createFileRoute("/profile")({
    loader: async () => {
        try {
            return await queryClient.ensureQueryData(currentUserQueryOptions);
        } catch {
            throw redirect({ to: "/login" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { currentUser } = useCurrentUser();

    const [username, setUsername] = useState(currentUser?.username);
    const [email, setEmail] = useState(currentUser?.email);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const [logoutAllSessions, setLogoutAllSessions] = useState(true);

    const [isPersonalInfoConfirmOpen, setIsPersonalInfoConfirmOpen] =
        useState(false);
    const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const CurrentPasswordFieldIcon = showCurrentPassword ? EyeOff : Eye;
    const NewPasswordFieldIcon = showNewPassword ? EyeOff : Eye;
    const ConfirmNewPasswordFieldIcon = showConfirmNewPassword ? EyeOff : Eye;

    const updateUserMutation = useUpdateUserMutation();
    const changePasswordMutation = useChangePasswordMutation();
    const deleteUserMutation = useDeleteUserMutation();

    const isDisabled =
        updateUserMutation.isPending ||
        changePasswordMutation.isPending ||
        deleteUserMutation.isPending;

    if (!currentUser) {
        return null;
    }

    const isPersonalInfoDirty =
        username !== currentUser.username || email !== currentUser.email;

    const isPasswordFormFilled =
        !!currentPassword && !!newPassword && !!confirmNewPassword;

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
            <div className="flex items-center gap-2">
                <Link to="/">
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <span className="text-xl font-semibold text-foreground">
                    Profile
                </span>
            </div>
            <div className="flex flex-col gap-0">
                <span className="w-fit text-base text-foreground">
                    {currentUser.username}
                </span>
                <span className="w-fit text-sm text-muted-foreground">
                    {currentUser.email}
                </span>
            </div>
            <Card className="w-full">
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsPersonalInfoConfirmOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex justify-start">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                                personal information
                            </span>
                        </div>
                        <Field>
                            <FieldLabel
                                htmlFor="username"
                                className="text-sm font-medium"
                            >
                                Username
                            </FieldLabel>
                            <InputField
                                placeholder="••••••••"
                                id="username"
                                type="text"
                                required
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isDisabled}
                            />
                        </Field>
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
                        <div className="flex w-full justify-end">
                            <Button
                                variant="default"
                                className="h-10 w-fit text-sm font-medium"
                                type="submit"
                                disabled={isDisabled || !isPersonalInfoDirty}
                            >
                                Save Changes
                                {isDisabled && (
                                    <Spinner data-icon="inline-end" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card className="w-full">
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (newPassword !== confirmNewPassword) {
                                errorToast("Passwords do not match");
                                return;
                            }
                            setIsPasswordConfirmOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex justify-start">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                                change password
                            </span>
                        </div>
                        <Field>
                            <FieldLabel
                                htmlFor="current-password"
                                className="text-sm font-medium"
                            >
                                Current password
                            </FieldLabel>
                            <div className="relative">
                                <InputField
                                    placeholder="••••••••"
                                    id="current-password"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    required
                                    autoComplete="current-password"
                                    minLength={8}
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    disabled={isDisabled}
                                />
                                <CurrentPasswordFieldIcon
                                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setShowCurrentPassword((prev) => !prev);
                                    }}
                                />
                            </div>
                        </Field>
                        <hr />
                        <Field>
                            <FieldLabel
                                htmlFor="new-password"
                                className="text-sm font-medium"
                            >
                                New password
                            </FieldLabel>
                            <div className="relative">
                                <InputField
                                    placeholder="••••••••"
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    disabled={isDisabled}
                                />
                                <NewPasswordFieldIcon
                                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setShowNewPassword((prev) => !prev);
                                    }}
                                />
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel
                                htmlFor="confirm-new-password"
                                className="text-sm font-medium"
                            >
                                Confirm new password
                            </FieldLabel>
                            <div className="relative">
                                <InputField
                                    placeholder="••••••••"
                                    id="confirm-new-password"
                                    type={
                                        showConfirmNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    value={confirmNewPassword}
                                    onChange={(e) =>
                                        setConfirmNewPassword(e.target.value)
                                    }
                                    required
                                    disabled={isDisabled}
                                />
                                <ConfirmNewPasswordFieldIcon
                                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setShowConfirmNewPassword(
                                            (prev) => !prev,
                                        );
                                    }}
                                />
                            </div>
                        </Field>
                        <Field orientation="horizontal">
                            <Checkbox
                                id="logout-all-sessions"
                                checked={logoutAllSessions}
                                onCheckedChange={(checked) =>
                                    setLogoutAllSessions(checked)
                                }
                                disabled={isDisabled}
                            />
                            <FieldLabel
                                htmlFor="logout-all-sessions"
                                className="text-sm font-normal"
                            >
                                Log out of all other sessions
                            </FieldLabel>
                        </Field>
                        <div className="flex w-full justify-end">
                            <Button
                                variant="default"
                                className="h-10 w-fit text-sm font-medium"
                                type="submit"
                                disabled={isDisabled || !isPasswordFormFilled}
                            >
                                Save Changes
                                {isDisabled && (
                                    <Spinner data-icon="inline-end" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsDeleteConfirmOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex justify-start">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                                danger zone
                            </span>
                        </div>
                        <div className="flex w-full justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                    Delete account
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Permanently remove your account and all quiz
                                    data. This cannot be undone.
                                </span>
                            </div>
                            <Button
                                variant="destructive"
                                className="h-10 w-fit bg-destructive! text-sm font-medium text-white"
                                type="submit"
                                disabled={isDisabled}
                            >
                                Delete account
                                {isDisabled && (
                                    <Spinner data-icon="inline-end" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={isPersonalInfoConfirmOpen}
                onOpenChange={setIsPersonalInfoConfirmOpen}
                title="Save changes to profile?"
                description="Your username and email will be updated."
                confirmLabel="Save Changes"
                isLoading={updateUserMutation.isPending}
                onConfirm={() => {
                    updateUserMutation.mutate(
                        { username, email },
                        {
                            onSuccess: () =>
                                setIsPersonalInfoConfirmOpen(false),
                        },
                    );
                }}
            />

            <ConfirmDialog
                open={isPasswordConfirmOpen}
                onOpenChange={setIsPasswordConfirmOpen}
                title="Change your password?"
                description={
                    logoutAllSessions
                        ? "You will be logged out of all other sessions."
                        : "Your other sessions will remain logged in."
                }
                confirmLabel="Change Password"
                isLoading={changePasswordMutation.isPending}
                onConfirm={() => {
                    changePasswordMutation.mutate(
                        {
                            current_password: currentPassword,
                            new_password: newPassword,
                            logout_all_sessions: logoutAllSessions,
                        },
                        {
                            onSuccess: () => {
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmNewPassword("");
                                setIsPasswordConfirmOpen(false);
                            },
                        },
                    );
                }}
            />

            <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Delete account?"
                description="Permanently remove your account and all quiz data. This cannot be undone."
                confirmLabel="Delete account"
                variant="destructive"
                isLoading={deleteUserMutation.isPending}
                onConfirm={() => {
                    deleteUserMutation.mutate();
                }}
            />
        </div>
    );
}
