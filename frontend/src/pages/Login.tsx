import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
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
        <h1 className="text-2xl font-bold text-center mb-6 font-cairo">تسجيل دخول</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "جاري التحميل..." : "دخول"}</Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          ليس لديك حساب؟ <Link to="/register" className="text-primary font-medium hover:underline">سجّل الآن</Link>
        </p>
      </Card>
    </div>
  );
}
