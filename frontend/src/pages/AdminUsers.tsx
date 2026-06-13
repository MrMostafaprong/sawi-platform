import { useEffect, useState } from "react";
import { adminService } from "../services/admin.service";
import type { AdminUser } from "../types";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { PageSpinner } from "../components/Spinner";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (p: number) => {
    setLoading(true);
    const data = await adminService.getAllUsers(p);
    setUsers(data.users);
    setTotalPages(data.totalPages);
    setPage(data.page);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const handleBan = async (id: string) => {
    try { setMsg((await adminService.banUser(id)).message); load(page); } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  const handleUnban = async (id: string) => {
    try { setMsg((await adminService.unbanUser(id)).message); load(page); } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 font-cairo">المستخدمين</h1>
      <p className="text-slate-400 text-sm mb-8">إدارة المستخدمين وحظر المخالفين</p>

      {msg && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm mb-6 border border-emerald-200">{msg}</div>}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right p-4 font-medium text-slate-500">المستخدم</th>
                <th className="text-right p-4 font-medium text-slate-500">البريد</th>
                <th className="text-right p-4 font-medium text-slate-500">الدور</th>
                <th className="text-right p-4 font-medium text-slate-500">الحالة</th>
                <th className="text-right p-4 font-medium text-slate-500">الجنس</th>
                <th className="text-left p-4 font-medium text-slate-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium">{u.displayName || u.username}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4"><Badge variant={u.role === "ADMIN" ? "primary" : "default"}>{u.role === "ADMIN" ? "مشرف" : "مستخدم"}</Badge></td>
                  <td className="p-4">
                    <Badge variant={u.status === "BANNED" ? "danger" : "success"}>{u.status === "BANNED" ? "محظور" : "نشط"}</Badge>
                  </td>
                  <td className="p-4 text-slate-500">{u.gender === "MALE" ? "ذكر" : u.gender === "FEMALE" ? "أنثى" : "-"}</td>
                  <td className="p-4">
                    {u.status === "BANNED" ? (
                      <Button size="sm" variant="primary" onClick={() => handleUnban(u.id)}>إلغاء الحظر</Button>
                    ) : u.role !== "ADMIN" ? (
                      <Button size="sm" variant="danger" onClick={() => handleBan(u.id)}>حظر</Button>
                    ) : <span className="text-xs text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                p === page ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
