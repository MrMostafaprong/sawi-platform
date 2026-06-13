import { useState } from "react";
import { reportService } from "../services/report.service";
import Button from "./Button";
import Card from "./Card";

interface Props {
  targetId: string;
  onClose: () => void;
}

const REASONS = ["رسائل مزعجة", "تحرش", "حساب مزيف", "محتوى غير مناسب", "أخرى"];

export default function ReportForm({ targetId, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { setMsg("الرجاء اختيار سبب"); return; }
    setSubmitting(true);
    try {
      const res = await reportService.create(targetId, reason, description || undefined);
      setMsg(res.message);
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <Card className="p-6 w-full max-w-md mx-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">الإبلاغ عن مستخدم</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">السبب</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
              <option value="">اختر سبباً</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تفاصيل إضافية (اختياري)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
          </div>
          {msg && <p className="text-sm text-emerald-600">{msg}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
