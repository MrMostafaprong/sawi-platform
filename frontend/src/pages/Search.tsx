import { useState } from "react";
import { Link } from "react-router-dom";
import { groupService } from "../services/group.service";
import { userService } from "../services/user.service";
import type { Group } from "../types";
import type { UserSearchResult } from "../services/user.service";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { getAssetUrl } from "../utils/assets";

type Tab = "groups" | "users";

export default function Search() {
  const [tab, setTab] = useState<Tab>("groups");

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupTotal, setGroupTotal] = useState(0);
  const [groupTotalPages, setGroupTotalPages] = useState(0);

  const [users, setUsers] = useState<UserSearchResult["users"]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    query: "", skill: "", city: "", gender: "", visibility: "",
  });
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (p = 1) => {
    setLoading(true);
    setPage(p);
    const params = { ...filters, page: p, query: filters.query || undefined };
    try {
      if (tab === "groups") {
        const res = await groupService.search(params);
        setGroups(res.groups);
        setGroupTotal(res.total);
        setGroupTotalPages(res.totalPages);
      } else {
        const res = await userService.search(params);
        setUsers(res.users);
        setUserTotal(res.total);
        setUserTotalPages(res.totalPages);
      }
      setSearched(true);
    } catch {
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setSearched(false);
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-cairo">بحث متقدم</h1>
        <p className="text-slate-400 text-sm mt-1">ابحث عن المجموعات والأعضاء حسب الاهتمامات والمهارات</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">كلمة مفتاحية</label>
            <input placeholder={tab === "groups" ? "اسم المجموعة..." : "اسم المستخدم..."} value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">المهارة</label>
            <input placeholder="تطوير، تصميم..." value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">المدينة</label>
            <input placeholder="الرياض، جدة..." value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">الجنس</label>
            <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
              <option value="">الكل</option>
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </div>
          {tab === "groups" && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">الخصوصية</label>
              <select value={filters.visibility} onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
                <option value="">الكل</option>
                <option value="PUBLIC">عام</option>
                <option value="FEMALE_ONLY">للنساء فقط</option>
                <option value="PRIVATE">خاص</option>
              </select>
            </div>
          )}
          <div className="flex items-end">
            <Button onClick={() => handleSearch()} disabled={loading} className="w-full">
              {loading ? "جاري البحث..." : "بحث"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl">
        <button onClick={() => switchTab("groups")}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${tab === "groups" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          مجموعات
        </button>
        <button onClick={() => switchTab("users")}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${tab === "users" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          أعضاء
        </button>
      </div>

      {searched && (
        <>
          <p className="text-sm text-slate-400 mb-4">
            {tab === "groups" ? groupTotal : userTotal} نتيجة
          </p>
          <div className="grid gap-4">
            {tab === "groups" ? (
              groups.length === 0 ? (
                <p className="text-slate-400 text-center py-12">لا توجد نتائج</p>
              ) : (
                groups.map((g) => (
                  <Card key={g.id} className="p-5" hover>
                    <Link to={`/groups/${g.id}`} className="block">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-800 hover:text-primary transition-colors">{g.name}</span>
                            <Badge>{g.visibility === "PUBLIC" ? "عام" : g.visibility === "FEMALE_ONLY" ? "للنساء فقط" : g.visibility === "PRIVATE" ? "خاص" : g.visibility}</Badge>
                          </div>
                          <p className="text-slate-500 text-sm mt-1">{g.description}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {g.creator?.displayName || g.creator?.username}
                            {g.creator?.city ? ` - ${g.creator.city}` : ""} &middot; {g._count?.members || 0} أعضاء
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))
              )
            ) : (
              users.length === 0 ? (
                <p className="text-slate-400 text-center py-12">لا توجد نتائج</p>
              ) : (
                users.map((u) => (
                  <Card key={u.id} className="p-5" hover>
                    <Link to={`/profile/${u.username}`} className="flex items-center gap-4">
                      <img src={getAssetUrl(u.avatarUrl)} alt=""
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/10" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{u.displayName || u.username}</span>
                          <Badge variant={u.role === "ADMIN" ? "accent" : "primary"}>
                            {u.role === "ADMIN" ? "مشرف" : u.role === "FREELANCER" ? "مستقل" : "عضو"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {u.city ? `${u.city} - ` : ""}{u.skills.slice(0, 3).join("، ")}{u.skills.length > 3 ? "..." : ""}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))
              )
            )}
          </div>
          {(tab === "groups" ? groupTotalPages : userTotalPages) > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: tab === "groups" ? groupTotalPages : userTotalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => handleSearch(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    p === page ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
