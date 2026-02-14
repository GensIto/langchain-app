import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/serverFunction/project.server";
import { getCompany } from "@/serverFunction/company.server";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/companies/$companyId/projects",
)({
  component: Projects,
  loader: async ({ params }) => {
    const company = await getCompany({ data: { id: params.companyId } });
    const projects = await getProjects({
      data: { companyId: params.companyId },
    });
    return { company, projects };
  },
});

function Projects() {
  const { company, projects } = Route.useLoaderData();
  const { companyId } = Route.useParams();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    id: string;
    name: string;
    description: string | null;
  } | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreate = async () => {
    try {
      await createProject({
        data: {
          name: projectName,
          companyId,
          description: projectDescription || undefined,
        },
      });
      toast.success("プロジェクトを作成しました");
      setIsCreateOpen(false);
      setProjectName("");
      setProjectDescription("");
      window.location.reload();
    } catch (error) {
      toast.error("プロジェクトの作成に失敗しました");
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!editingProject) return;
    try {
      await updateProject({
        data: {
          id: editingProject.id,
          name: projectName,
          description: projectDescription || undefined,
        },
      });
      toast.success("プロジェクトを更新しました");
      setIsEditOpen(false);
      setEditingProject(null);
      setProjectName("");
      setProjectDescription("");
      window.location.reload();
    } catch (error) {
      toast.error("プロジェクトの更新に失敗しました");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このプロジェクトを削除しますか?")) return;
    try {
      await deleteProject({ data: { id } });
      toast.success("プロジェクトを削除しました");
      window.location.reload();
    } catch (error) {
      toast.error("プロジェクトの削除に失敗しました");
      console.error(error);
    }
  };

  const openEditDialog = (project: {
    id: string;
    name: string;
    description: string | null;
  }) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || "");
    setIsEditOpen(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
      <div className='container mx-auto py-8 px-4'>
        <div className='mb-6'>
          <Button
            variant='outline'
            onClick={() => navigate({ to: "/companies" })}
            className='mb-4'
          >
            ← 会社一覧に戻る
          </Button>
          <h2 className='text-2xl font-semibold text-gray-300'>
            {company.name}
          </h2>
        </div>

        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-white'>プロジェクト一覧</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>新規作成</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>プロジェクトを作成</DialogTitle>
                <DialogDescription>
                  新しいプロジェクトの情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>プロジェクト名</Label>
                  <Input
                    id='name'
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder='プロジェクト名を入力'
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='description'>説明</Label>
                  <Textarea
                    id='description'
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder='プロジェクトの説明を入力'
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreate}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {projects.map((project) => (
            <Card
              key={project.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.description || "説明なし"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 text-sm text-gray-500'>
                  作成日:{" "}
                  {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => openEditDialog(project)}
                  >
                    編集
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDelete(project.id)}
                  >
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 mb-4'>
              まだプロジェクトが登録されていません
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              最初のプロジェクトを作成
            </Button>
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プロジェクトを編集</DialogTitle>
              <DialogDescription>
                プロジェクトの情報を変更してください
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-name'>プロジェクト名</Label>
                <Input
                  id='edit-name'
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder='プロジェクト名を入力'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-description'>説明</Label>
                <Textarea
                  id='edit-description'
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder='プロジェクトの説明を入力'
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsEditOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleEdit}>更新</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
