import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profile.service";
import { reviewService } from "../services/review.service";
import type { ProfileData, Review, ReviewListResult } from "../types";
import ReviewForm from "../components/ReviewForm";
import ReportForm from "../components/ReportForm";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { PageSpinner } from "../components/Spinner";
import { getAssetUrl } from "../utils/assets";

const CURRENCY_LABELS: Record<string, string> = {
  SAR: "ريال سعودي", AED: "درهم إماراتي", EGP: "جنيه مصري",
  KWD: "دينار كويتي", QAR: "ريال قطري", BHD: "دينار بحريني",
  OMR: "ريال عماني", JOD: "دينار أردني", LBP: "ليرة لبنانية",
  SYP: "ليرة سورية", IQD: "دينار عراقي", YER: "ريال يمني",
  LYD: "دينار ليبي", TND: "دينار تونسي", DZD: "دينار جزائري",
  MAD: "درهم مغربي", MRU: "أوقية موريتانية", SDG: "جنيه سوداني",
  SOS: "شلن صومالي", DJF: "فرنك جيبوتي", KMF: "فرنك قمري",
  MVR: "روفية جزر المالديف",
};

function currencyLabel(code?: string | null): string {
  return CURRENCY_LABELS[code || "SAR"] || code || "ريال سعودي";
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<ReviewListResult | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profileService
      .getPublicProfile(username)
      .then((p) => {
        setProfile(p);
        reviewService.getForUser(p.id).then(setReviews).catch(() => {});
      })
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <PageSpinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profile) return null;

  const { portfolio } = profile;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary transition-colors mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        العودة للرئيسية
      </Link>

      <Card className="p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img src={getAssetUrl(profile.avatarUrl)} alt={profile.displayName || profile.username}
            className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-2 ring-primary/10" />
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-2xl font-bold">{profile.displayName || profile.username}</h1>
            <p className="text-slate-400 text-sm">@{profile.username}</p>
            {profile.gender && <Badge variant="primary" size="sm" className="mt-1">{profile.gender === "MALE" ? "ذكر" : "أنثى"}</Badge>}
            {profile.bio && <p className="text-slate-600 mt-3">{profile.bio}</p>}
            {profile.skills.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap justify-center sm:justify-start">
                {profile.skills.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            )}
            {user && user.username !== username && (
              <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                <Button size="sm" variant="accent" onClick={() => setShowReview(!showReview)}>
                  {showReview ? "إلغاء" : "تقييم"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReport(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  بلاغ
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {showReview && (
        <div className="mb-6">
          <ReviewForm targetId={profile.id} onCreated={() => setShowReview(false)} />
        </div>
      )}
      {showReport && <ReportForm targetId={profile.id} onClose={() => setShowReport(false)} />}

      {portfolio?.showContact && profile.email && (
        <Card className="p-4 mb-6 bg-primary-50 border-primary/20">
          <p className="text-sm font-medium">📧 {profile.email}</p>
          {profile.phoneNumber && <p className="text-sm font-medium mt-1">📞 {profile.phoneNumber}</p>}
        </Card>
      )}

      {portfolio && (
        <Card className="p-6 mb-6">
          {portfolio.title && <h2 className="text-xl font-bold mb-1">{portfolio.title}</h2>}
          {portfolio.description && <p className="text-slate-500 text-sm mb-4">{portfolio.description}</p>}
          <div className="flex gap-4 flex-wrap text-sm">
            {portfolio.websiteUrl && <a href={portfolio.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">ويب سايت</a>}
            {portfolio.githubUrl && <a href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">GitHub</a>}
            {portfolio.linkedinUrl && <a href={portfolio.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">LinkedIn</a>}
          </div>
          {portfolio.hourlyRate && <p className="text-sm text-slate-500 mt-3">💰 {portfolio.hourlyRate} {currencyLabel(profile.currency)}/ساعة</p>}
          {portfolio.experienceYears && <p className="text-sm text-slate-500">📅 خبرة {portfolio.experienceYears} سنوات</p>}
        </Card>
      )}

      {portfolio && portfolio.items.length > 0 && (
        <h2 className="text-xl font-bold mb-4 font-cairo">أعمالي</h2>
      )}
      {portfolio && portfolio.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {portfolio.items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              {item.type === "IMAGE" && item.thumbnailUrl && (
                <img src={getAssetUrl(item.thumbnailUrl)} alt={item.caption || ""}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
              {item.type === "VIDEO" && (
                <video src={getAssetUrl(item.url)} controls className="w-full h-48 object-cover" />
              )}
              {item.type === "LINK" && (
                <div className="p-4">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block text-sm">{item.caption || item.url}</a>
                </div>
              )}
              {item.caption && <p className="p-3 text-sm text-slate-500">{item.caption}</p>}
            </Card>
          ))}
        </div>
      )}

      {reviews && reviews.reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 font-cairo">
            التقييمات
            <span className="text-sm font-normal text-slate-400 mr-2">
              ({reviews.avgRating.toFixed(1)} ★ &middot; {reviews.reviewCount})
            </span>
          </h2>
          <div className="space-y-3">
            {reviews.reviews.map((r: Review) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <img src={getAssetUrl(r.author?.avatarUrl)}
                    className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-medium text-sm">{r.author?.displayName || r.author?.username}</span>
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
