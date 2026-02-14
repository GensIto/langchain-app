import { createFileRoute } from "@tanstack/react-router";

import { SignInForm } from "@/components/auth/SignInForm";

export const Route = createFileRoute("/signin")({
	component: SignInForm,
});
