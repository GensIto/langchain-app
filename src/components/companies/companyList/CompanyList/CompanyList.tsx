import { useState } from "react";

import { CompanyCard } from "../CompanyCard";
import { CreateCompanyDialog } from "../CreateCompanyDialog";
import { EditCompanyDialog } from "../EditCompanyDialog";
import { EmptyState } from "../EmptyState";

import type { EditableCompany } from "../types";

type CompanyListProps = {
	companies: {
		id: string;
		name: string;
		createdAt: Date;
	}[];
};

export function CompanyList({ companies }: CompanyListProps) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingCompany, setEditingCompany] = useState<EditableCompany | null>(null);

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<div className='container mx-auto py-8 px-4'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold text-white'>会社一覧</h1>
					<CreateCompanyDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{companies.map((company) => (
						<CompanyCard key={company.id} company={company} onEdit={setEditingCompany} />
					))}
				</div>

				{companies.length === 0 && <EmptyState onCreateClick={() => setIsCreateOpen(true)} />}

				<EditCompanyDialog
					key={editingCompany?.id}
					company={editingCompany}
					onClose={() => setEditingCompany(null)}
				/>
			</div>
		</div>
	);
}
