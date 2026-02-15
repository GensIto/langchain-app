import { useNavigate } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { EpisodeWithTags } from "../types";

const impactLevelVariant = {
	high: "destructive",
	medium: "default",
	low: "secondary",
} as const;

const impactLevelLabel = {
	high: "High",
	medium: "Medium",
	low: "Low",
} as const;

type EpisodeCardProps = {
	episode: EpisodeWithTags;
};

export function EpisodeCard({ episode }: EpisodeCardProps) {
	const navigate = useNavigate();

	const handleViewDetail = () => {
		void navigate({
			to: "/episodes/$episodeId",
			params: { episodeId: episode.id },
		});
	};

	return (
		<Card className='hover:shadow-lg transition-shadow'>
			<CardHeader>
				<div className='flex justify-between items-start'>
					<div className='flex-1'>
						<CardTitle className='text-lg mb-1'>{episode.title}</CardTitle>
						<CardDescription className='mb-2'>
							作成日: {new Date(episode.createdAt).toLocaleString("ja-JP")}
						</CardDescription>
						<div className='flex flex-wrap gap-2 mb-2'>
							<Badge variant={impactLevelVariant[episode.impactLevel]}>
								{impactLevelLabel[episode.impactLevel]}
							</Badge>
							{episode.tags.map((tag) => (
								<Badge key={tag.id} variant='outline'>
									{tag.name}
								</Badge>
							))}
						</div>
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' size='sm' onClick={handleViewDetail}>
							詳細を見る
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className='text-sm text-gray-400 line-clamp-2'>{episode.situation}</p>
			</CardContent>
		</Card>
	);
}
