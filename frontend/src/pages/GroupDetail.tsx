import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { groupService } from "../services/group.service";
import type { Group, GroupMember, GroupReview, GroupReviewListResult } from "../types";
import { useParams, Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { PageSpinner } from "../components/Spinner";
import { getAssetUrl } from "../utils/assets";

const VISIBILITY_LABELS: Record<string, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "accent" }> = {
  PUBLIC: { label: "عام", variant: "success" },
  FEMALE_ONLY: { label: "للنساء فقط", variant: "warning" },
  PRIVATE: { label: "خاص", variant: "danger" },
  INVITE_ONLY: { label: "دعوة فقط", variant: "primary" },
};

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<GroupReviewListResult | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    setForbidden(false);
    setErrMsg("");
    let mounted = true;
    groupService.getById(id).then((g) => { if (mounted) setGroup(g); }).catch((e) => {
      if (e.response?.status === 403) {
        if (mounted) { setForbidden(true); setErrMsg(e.response.data.message); }
      } else {
        if (mounted) setGroup(null);
      }
    }).finally(() => { if (mounted) setLoading(false); });
    groupService.getReviews(id).then((r) => { if (mounted) setReviews(r); }).catch(() => {});
    return () => { mounted = false; };
  }, [id]);

  const load = () => {
    if (!id) return;
    setForbidden(false);
    setLoading(true);
    groupService.getById(id).then((g) => setGroup(g)).catch(() => setGroup(null)).finally(() => setLoading(false));
    groupService.getReviews(id).then(setReviews).catch(() => {});
  };

  const handleJoin = async () => {
    try { setMsg((await groupService.join(group!.id)).message); load(); } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  const handleLeave = async () => {
    try { setMsg((await groupService.leave(group!.id)).message); load(); } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  const handleFollow = async () => {
    try { setMsg((await groupService.follow(group!.id)).message); load(); } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  const handleUnfollow = async () => {
    try { setMsg((await groupService.unfollow(group!.id)).message); load(); } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) { setMsg("الرجاء اختيار تقييم"); return; }
    setSubmittingReview(true);
    try {
      const res = await groupService.createReview(group!.id, reviewRating, reviewComment || undefined);
      setMsg(res.message);
      setReviewRating(0);
      setReviewComment("");
      setShowReviewForm(false);
      load();
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message);
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <PageSpinner />;
  if (forbidden) return <div className="p-8 text-center">
    <div className="max-w-md mx-auto bg-amber-50 text-amber-700 p-6 rounded-2xl border border-amber-200">
      <p className="font-bold text-lg mb-2">🚫 ممنوع</p>
      <p>{errMsg}</p>
    </div>
  </div>;
  if (!group) return <div className="p-8 text-center text-red-500">المجموعة غير موجودة</div>;

  const vis = (v: string) => VISIBILITY_LABELS[v] || { label: v, variant: "default" as const };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/groups" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary transition-colors mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        العودة للمجموعات
      </Link>

      <Card className="p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <Badge variant={vis(group.visibility).variant}>{vis(group.visibility).label}</Badge>
            </div>
            {group.description && <p className="text-slate-600">{group.description}</p>}
            <p className="text-sm text-slate-400 mt-3">
              بواسطة {group.creator?.displayName || group.creator?.username}
              &middot; {group._count?.members || 0} أعضاء
              {group._count?.follows !== undefined && <> &middot; {group._count.follows} متابع</>}
            </p>
          </div>
        </div>

        {msg && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm mt-4 border border-emerald-200">{msg}</div>}

        {user && (
          <div className="flex gap-2 mt-6 flex-wrap">
            {!group.isMember ? (
              <Button size="sm" onClick={handleJoin}>انضمام</Button>
            ) : (
              <Button size="sm" variant="danger" onClick={handleLeave}>مغادرة</Button>
            )}
            {group.isFollowing ? (
              <Button size="sm" variant="secondary" onClick={handleUnfollow}>إلغاء المتابعة</Button>
            ) : (
              <Button size="sm" variant="accent" onClick={handleFollow}>متابعة</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? "إلغاء" : "تقييم"}
            </Button>
          </div>
        )}
      </Card>

      {showReviewForm && user && (
        <Card className="p-5 mb-6">
          <h3 className="font-bold text-lg mb-3">تقييم المجموعة</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setReviewRating(n)}
                  className={`w-10 h-10 rounded-xl text-lg font-bold transition-all ${
                    n <= reviewRating ? "bg-amber-400 text-white scale-110 shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >★</button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="اكتب تعليقاً (اختياري)"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" rows={3} />
            <Button type="submit" size="sm" disabled={submittingReview}>
              {submittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
          </form>
        </Card>
      )}

      <h2 className="text-lg font-bold mb-4">الأعضاء ({group.members?.length || 0})</h2>
      <div className="grid gap-3">
        {group.members?.map((m: GroupMember) => (
          <Card key={m.id} className="p-3">
            <div className="flex items-center gap-3">
              <img src={getAssetUrl(m.user?.avatarUrl)}
                alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div className="flex-1">
                <Link to={`/profile/${m.user?.username}`} className="font-medium text-sm hover:text-primary transition-colors">
                  {m.user?.displayName || m.user?.username}
                </Link>
                <Badge size="sm" className="mr-2">{m.role === "OWNER" ? "منشئ" : "عضو"}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {reviews && reviews.reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">
            تقييمات المجموعة
            <span className="text-sm font-normal text-slate-400 mr-2">({reviews.avgRating.toFixed(1)} ★ &middot; {reviews.reviewCount})</span>
          </h2>
          <div className="space-y-3">
            {reviews.reviews.map((r: GroupReview) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <img src={getAssetUrl(r.user?.avatarUrl)}
                    className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-medium text-sm">{r.user?.displayName || r.user?.username}</span>
                  <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-slate-600 mr-10">{r.comment}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}