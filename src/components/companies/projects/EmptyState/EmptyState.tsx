import { Button } from "@/components/ui/button";

import { LABELS } from "./constants";

import type { EmptyStateProps } from "./types";

export function EmptyState({ onCreateClick }: EmptyStateProps) {
	return (
		<div className='text-center py-12'>
			<p className='text-gray-400 mb-4'>{LABELS.emptyMessage}</p>
			<Button onClick={onCreateClick}>{LABELS.emptyAction}</Button>
		</div>
	);
}
