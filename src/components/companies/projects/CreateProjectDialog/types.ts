export type CreateProjectDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	projectName: string;
	onProjectNameChange: (value: string) => void;
	projectDescription: string;
	onProjectDescriptionChange: (value: string) => void;
	onSubmit: () => Promise<void>;
	onCancel: () => void;
};
