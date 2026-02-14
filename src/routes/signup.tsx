import { createFileRoute } from "@tanstack/react-router";

import { SignUpForm } from "@/components/auth/SignUpForm";

export const Route = createFileRoute("/signup")({
	component: SignUpForm,
});
