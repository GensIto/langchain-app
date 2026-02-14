import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/serverFunction/company.server";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/companies/")({
  component: Companies,
  loader: async () => {
    const companies = await getCompanies();
    return { companies };
  },
});

function Companies() {
  const { companies } = Route.useLoaderData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [companyName, setCompanyName] = useState("");

  const handleCreate = async () => {
    try {
      await createCompany({ data: { name: companyName } });
      toast.success("会社を作成しました");
      setIsCreateOpen(false);
      setCompanyName("");
      window.location.reload();
    } catch (error) {
      toast.error("会社の作成に失敗しました");
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!editingCompany) return;
    try {
      await updateCompany({
        data: { id: editingCompany.id, name: companyName },
      });
      toast.success("会社を更新しました");
      setIsEditOpen(false);
      setEditingCompany(null);
      setCompanyName("");
      window.location.reload();
    } catch (error) {
      toast.error("会社の更新に失敗しました");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この会社を削除しますか?")) return;
    try {
      await deleteCompany({ data: { id } });
      toast.success("会社を削除しました");
      window.location.reload();
    } catch (error) {
      toast.error("会社の削除に失敗しました");
      console.error(error);
    }
  };

  const openEditDialog = (company: { id: string; name: string }) => {
    setEditingCompany(company);
    setCompanyName(company.name);
    setIsEditOpen(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
      <div className='container mx-auto py-8 px-4'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-white'>会社一覧</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>新規作成</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>会社を作成</DialogTitle>
                <DialogDescription>
                  新しい会社の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>会社名</Label>
                  <Input
                    id='name'
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder='会社名を入力'
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
          {companies.map((company) => (
            <Card
              key={company.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>
                  作成日:{" "}
                  {new Date(company.createdAt).toLocaleDateString("ja-JP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex gap-2'>
                  <Link
                    to='/companies/$companyId/projects'
                    params={{ companyId: company.id }}
                  >
                    <Button variant='outline' size='sm'>
                      プロジェクト
                    </Button>
                  </Link>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => openEditDialog(company)}
                  >
                    編集
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDelete(company.id)}
                  >
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 mb-4'>まだ会社が登録されていません</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              最初の会社を作成
            </Button>
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>会社を編集</DialogTitle>
              <DialogDescription>
                会社の情報を変更してください
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-name'>会社名</Label>
                <Input
                  id='edit-name'
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder='会社名を入力'
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
