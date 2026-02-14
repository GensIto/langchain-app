import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "@/db";
import { account, session, user, verification } from "@/db/schema";

const schema = {
	account,
	session,
	user,
	verification,
};

export const auth = betterAuth({
	database: drizzleAdapter(getDb(), {
		provider: "sqlite",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies()],
});

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type RequiredSession = NonNullable<Session>;
