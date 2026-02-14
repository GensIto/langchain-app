import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black'>
        <div className='text-white text-xl'>読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to='/signin' />;
  }

  return <Outlet />;
}
