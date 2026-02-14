import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useDeleteCompany } from "./hooks/useDeleteCompany";

import type { EditableCompany } from "../types";

type CompanyCardProps = {
	company: {
		id: string;
		name: string;
		createdAt: Date;
	};
	onEdit: (company: EditableCompany) => void;
};

export function CompanyCard({ company, onEdit }: CompanyCardProps) {
	const { handleDelete } = useDeleteCompany();

	return (
		<Card className='hover:shadow-lg transition-shadow'>
			<CardHeader>
				<CardTitle>{company.name}</CardTitle>
				<CardDescription>
					作成日: {new Date(company.createdAt).toLocaleDateString("ja-JP")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='flex gap-2'>
					<Link to='/companies/$companyId/projects' params={{ companyId: company.id }}>
						<Button variant='outline' size='sm'>
							プロジェクト
						</Button>
					</Link>
					<Button variant='outline' size='sm' onClick={() => onEdit(company)}>
						編集
					</Button>
					<Button variant='destructive' size='sm' onClick={() => void handleDelete(company.id)}>
						削除
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
