import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "", gender: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("كلمة المرور غير متطابقة"); return; }
    setLoading(true);
    try {
      await register(form.email, form.username, form.password, form.confirm, form.gender || undefined);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6 font-cairo">إنشاء حساب</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم</label>
            <input type="text" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تأكيد كلمة المرور</label>
            <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الجنس (اختياري)</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">-- اختر --</option>
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "جاري التحميل..." : "تسجيل"}</Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          لديك حساب؟ <Link to="/login" className="text-primary font-medium hover:underline">تسجيل دخول</Link>
        </p>
      </Card>
    </div>
  );
}
