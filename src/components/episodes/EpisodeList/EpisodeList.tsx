import { EpisodeCard } from "../EpisodeCard/EpisodeCard";

import type { EpisodeWithTags } from "../types";

type EpisodeListProps = {
	episodes: EpisodeWithTags[];
};

export function EpisodeList({ episodes }: EpisodeListProps) {
	return (
		<div className='container mx-auto py-8 px-4'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-white'>エピソード一覧</h1>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{episodes.map((episode) => (
					<EpisodeCard key={episode.id} episode={episode} />
				))}
			</div>

			{episodes.length === 0 && (
				<div className='text-center py-12'>
					<p className='text-gray-400 text-lg'>
						エピソードがまだありません。ログからエピソードを作成してみましょう。
					</p>
				</div>
			)}
		</div>
	);
}
