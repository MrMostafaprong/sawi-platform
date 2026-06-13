import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { groupService } from "../services/group.service";
import type { Group } from "../types";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { PageSpinner } from "../components/Spinner";

const VISIBILITY_LABELS: Record<string, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" }> = {
  PUBLIC: { label: "عام", variant: "success" },
  FEMALE_ONLY: { label: "للنساء فقط", variant: "warning" },
  PRIVATE: { label: "خاص", variant: "danger" },
  INVITE_ONLY: { label: "دعوة فقط", variant: "primary" },
};

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", visibility: "PUBLIC" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupService.search({}).then((r) => setGroups(r.groups)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await groupService.create(form);
      setGroups((prev) => [res.group, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", visibility: "PUBLIC" });
      setMsg("تم إنشاء المجموعة!");
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      const res = await groupService.join(id);
      setMsg(res.message);
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  const handleLeave = async (id: string) => {
    try {
      const res = await groupService.leave(id);
      setMsg(res.message);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <PageSpinner />;

  const vis = (v: string) => VISIBILITY_LABELS[v] || { label: v, variant: "default" as const };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-cairo">المجموعات</h1>
          <p className="text-slate-400 text-sm mt-1">اكتشف وانضم إلى مجموعات تهمك</p>
        </div>
        <div className="flex gap-2">
          <Link to="/search">
            <Button variant="secondary" size="sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              بحث
            </Button>
          </Link>
          {user && (
            <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? "إلغاء" : "مجموعة جديدة"}
            </Button>
          )}
        </div>
      </div>

      {msg && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm mb-6 border border-emerald-200">{msg}</div>}

      {showCreate && user && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">مجموعة جديدة</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">اسم المجموعة</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الخصوصية</label>
              <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
                <option value="PUBLIC">عام</option>
                {user?.gender === "FEMALE" && <option value="FEMALE_ONLY">للنساء فقط</option>}
                <option value="PRIVATE">خاص</option>
                <option value="INVITE_ONLY">دعوة فقط</option>
              </select>
            </div>
            <Button type="submit">إنشاء</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="p-5" hover>
            <Link to={`/groups/${group.id}`} className="block">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-800 hover:text-primary transition-colors">
                      {group.name}
                    </span>
                    <Badge variant={vis(group.visibility).variant}>{vis(group.visibility).label}</Badge>
                  </div>
                  {group.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{group.description}</p>}
                  <p className="text-xs text-slate-400 mt-2">
                    {group.creator?.displayName || group.creator?.username}
                    {group.creator?.city ? ` - ${group.creator.city}` : ""} &middot; {group._count?.members || 0} أعضاء
                  </p>
                </div>
                {user && (
                  <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" onClick={() => handleJoin(group.id)}>انضمام</Button>
                    <Button size="sm" variant="danger" onClick={() => handleLeave(group.id)}>مغادرة</Button>
                  </div>
                )}
              </div>
            </Link>
          </Card>
        ))}
        {groups.length === 0 && <p className="text-slate-400 text-center py-12">لا توجد مجموعات</p>}
      </div>
    </div>
  );
}
