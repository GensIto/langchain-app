import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for React components
 * Use this client to interact with authentication in your components
 */
export const authClient = createAuthClient();

/**
 * Export useful hooks from better-auth
 * Usage example:
 *
 * import { useSession } from '@/lib/auth-client';
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <div>Not logged in</div>;
 *
 *   return <div>Hello, {session.user.name}!</div>;
 * }
 */
export const { useSession, signIn, signUp, signOut, $Infer } = authClient;
