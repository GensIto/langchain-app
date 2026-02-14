import { Button } from "@/components/ui/button";

type EmptyStateProps = {
	onCreateClick: () => void;
};

export function EmptyState({ onCreateClick }: EmptyStateProps) {
	return (
		<div className='text-center py-12'>
			<p className='text-gray-400 mb-4'>まだ会社が登録されていません</p>
			<Button onClick={onCreateClick}>最初の会社を作成</Button>
		</div>
	);
}
