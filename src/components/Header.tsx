import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<header className='p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg'>
			<h1 className='ml-4 text-xl font-semibold'>
				<Link to='/'>Career Memory</Link>
			</h1>
			<nav className='mr-4 flex gap-4'>
				<Link to='/companies' className='hover:text-gray-300 transition-colors'>
					会社・プロジェクト
				</Link>
			</nav>
		</header>
	);
}
