import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	useEffect(() => {
		if (session) {
			void navigate({ to: "/companies" });
		}
	}, [session, navigate]);

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<section className='relative py-20 px-6 text-center overflow-hidden h-lvh'>
				<p className='text-2xl md:text-3xl text-gray-300 mb-4 font-light'>
					The framework for next generation AI applications
				</p>
				<Link to='/signin'>
					<Button>Sign in</Button>
				</Link>
			</section>
		</div>
	);
}
