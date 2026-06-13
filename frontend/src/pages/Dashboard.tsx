import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profile.service";
import type { ProfileData } from "../types";
import Button from "../components/Button";
import { getAssetUrl } from "../utils/assets";
import Card from "../components/Card";


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({
    displayName: "", bio: "", phoneNumber: "",
    skills: "", gender: "MALE", currency: "SAR",
    title: "", description: "", websiteUrl: "", githubUrl: "", linkedinUrl: "",
    hourlyRate: "", experienceYears: "", city: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    profileService.getMyProfile().then((p) => {
      setProfile(p);
      setForm({
        displayName: p.displayName || "",
        bio: p.bio || "",
        phoneNumber: p.phoneNumber || "",
        skills: p.skills.join(", "),
        gender: p.gender || "MALE",
        currency: p.currency || "SAR",
        title: p.portfolio?.title || "",
        description: p.portfolio?.description || "",
        websiteUrl: p.portfolio?.websiteUrl || "",
        githubUrl: p.portfolio?.githubUrl || "",
        linkedinUrl: p.portfolio?.linkedinUrl || "",
        hourlyRate: p.portfolio?.hourlyRate?.toString() || "",
        experienceYears: p.portfolio?.experienceYears?.toString() || "",
        city: p.city || "",
      });
    });
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    setSaving(true);
    try {
      await profileService.updateProfile({
        displayName: form.displayName || undefined,
        bio: form.bio || undefined,
        phoneNumber: form.phoneNumber || undefined,
        gender: form.gender,
        currency: form.currency || undefined,
        city: form.city || undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        title: form.title || undefined,
        description: form.description || undefined,
        websiteUrl: form.websiteUrl || undefined,
        githubUrl: form.githubUrl || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
      });
      setMessage("تم الحفظ");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await profileService.uploadResume(file);
      setMessage("تم رفع السيرة الذاتية");
      setProfile(await profileService.getMyProfile());
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
    if (e.target) e.target.value = "";
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await profileService.updateAvatar(file);
      setMessage("تم تحديث الصورة");
      setProfile((p) => p ? { ...p, avatarUrl: res.avatarUrl } : p);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      if (files.length === 1) {
        await profileService.uploadMedia(files[0]);
      } else {
        await profileService.uploadMultiple(files);
      }
      setMessage(`تم رفع ${files.length} ملف`);
      setProfile(await profileService.getMyProfile());
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
    if (e.target) e.target.value = "";
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      await profileService.uploadMultiple(files);
      setMessage(`تم رفع ${files.length} ملف من المجلد`);
      setProfile(await profileService.getMyProfile());
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
    if (e.target) e.target.value = "";
  };

  const handleToggleContact = async () => {
    try {
      const res = await profileService.toggleContactVisibility();
      setMessage(`إظهار جهات الاتصال: ${res.showContact ? "ظاهر" : "مخفي"}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-cairo">لوحة التحكم</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{user.displayName || user.username}</span>
          <Button variant="ghost" size="sm" onClick={logout}>تسجيل خروج</Button>
        </div>
      </div>

      {message && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm mb-6 border border-emerald-200">{message}</div>}
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm mb-6 border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">الملف الشخصي</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم المعروض</label>
                  <input name="displayName" value={form.displayName} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">رقم الجوال</label>
                  <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الجنس</label>
                  <select name="gender" value={form.gender} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
                    <option value="MALE">ذكر</option>
                    <option value="FEMALE">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العملة</label>
                  <select name="currency" value={form.currency} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="KWD">دينار كويتي (KWD)</option>
                    <option value="QAR">ريال قطري (QAR)</option>
                    <option value="BHD">دينار بحريني (BHD)</option>
                    <option value="OMR">ريال عماني (OMR)</option>
                    <option value="JOD">دينار أردني (JOD)</option>
                    <option value="LBP">ليرة لبنانية (LBP)</option>
                    <option value="SYP">ليرة سورية (SYP)</option>
                    <option value="IQD">دينار عراقي (IQD)</option>
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="LYD">دينار ليبي (LYD)</option>
                    <option value="TND">دينار تونسي (TND)</option>
                    <option value="DZD">دينار جزائري (DZD)</option>
                    <option value="MAD">درهم مغربي (MAD)</option>
                    <option value="MRU">أوقية موريتانية (MRU)</option>
                    <option value="SDG">جنيه سوداني (SDG)</option>
                    <option value="SOS">شلن صومالي (SOS)</option>
                    <option value="DJF">فرنك جيبوتي (DJF)</option>
                    <option value="KMF">فرنك قمري (KMF)</option>
                    <option value="MVR">روفية جزر المالديف (MVR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المدينة</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="الرياض، جدة، ..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نبذة</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المهارات (مفصولة بفواصل)</label>
                <input name="skills" value={form.skills} onChange={handleChange} placeholder="تطوير، تصميم، تسويق"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <hr className="border-slate-100" />
              <h3 className="font-bold text-sm text-slate-500">المحفظة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="title" placeholder="عنوان المحفظة" value={form.title} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <input name="hourlyRate" type="number" placeholder="السعر في الساعة" value={form.hourlyRate} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <input name="experienceYears" type="number" placeholder="سنوات الخبرة" value={form.experienceYears} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <input name="websiteUrl" placeholder="الموقع الإلكتروني" value={form.websiteUrl} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <input name="githubUrl" placeholder="GitHub" value={form.githubUrl} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <input name="linkedinUrl" placeholder="LinkedIn" value={form.linkedinUrl} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <textarea name="description" placeholder="وصف المحفظة" value={form.description} onChange={handleChange} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              <Button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">الصورة الشخصية</h2>
            <div className="flex flex-col items-center gap-3">
              <img src={getAssetUrl(profile?.avatarUrl)}
                alt="avatar" className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-2 ring-primary/10" />
              <Button size="sm" variant="secondary" onClick={() => avatarRef.current?.click()}>
                تغيير الصورة
              </Button>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">رفع وسائط</h2>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              </div>
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>اختيار ملفات</Button>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleUpload} className="hidden" />
              <Button size="sm" variant="secondary" onClick={() => folderRef.current?.click()}>رفع مجلد كامل</Button>
              <input ref={folderRef} type="file" accept="image/*,video/*" multiple onChange={handleFolderUpload} className="hidden" {...{ webkitdirectory: "" } as any} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">إظهار جهات الاتصال</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">الحالة: {profile?.portfolio?.showContact ? "ظاهر" : "مخفي"}</span>
              <Button size="sm" variant="secondary" onClick={handleToggleContact}>تغيير</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">السيرة الذاتية (CV)</h2>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              {profile?.portfolio?.resumeUrl && (
                <a href={getAssetUrl(profile.portfolio.resumeUrl)} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-medium">عرض السيرة الذاتية</a>
              )}
              <Button size="sm" variant="secondary" onClick={() => resumeRef.current?.click()}>
                {profile?.portfolio?.resumeUrl ? "تحديث السيرة الذاتية" : "رفع السيرة الذاتية"}
              </Button>
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" onChange={handleResume} className="hidden" />
            </div>
          </Card>

          {profile?.portfolio?.items && profile.portfolio.items.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">الوسائط المرفوعة ({profile.portfolio.items.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {profile.portfolio.items.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-xl overflow-hidden group relative">
                    {item.type === "IMAGE" ? (
                      <a href={getAssetUrl(item.url)} target="_blank" rel="noopener noreferrer">
                        <img src={getAssetUrl(item.thumbnailUrl || item.url)} alt={item.caption || ""}
                          className="w-full h-32 object-cover" loading="lazy" />
                      </a>
                    ) : item.type === "VIDEO" ? (
                      <video src={getAssetUrl(item.url)} controls className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
                        رابط
                      </div>
                    )}
                    <div className="p-2">
                      {item.caption && <p className="text-xs text-slate-600 truncate">{item.caption}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <a href={getAssetUrl(item.url)} download
                          className="text-xs text-primary hover:text-primary-dark font-medium">
                          تنزيل
                        </a>
                        <button onClick={async () => {
                          await profileService.deleteMedia(item.id);
                          setProfile(await profileService.getMyProfile());
                        }} className="text-xs text-red-400 hover:text-red-600 font-medium">حذف</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {user?.role === "ADMIN" && (
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 text-accent">لوحة المشرف</h2>
            <div className="flex gap-3 flex-wrap">
              <Link to="/admin"><Button variant="accent" size="sm">لوحة التحكم</Button></Link>
              <Link to="/admin/reports"><Button variant="secondary" size="sm">التقارير</Button></Link>
              <Link to="/admin/images"><Button variant="secondary" size="sm">الصور</Button></Link>
              <Link to="/admin/users"><Button variant="secondary" size="sm">المستخدمين</Button></Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
