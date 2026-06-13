import { useState } from "react";
import { reviewService } from "../services/review.service";
import Button from "./Button";
import Card from "./Card";

interface Props {
  targetId: string;
  onCreated?: () => void;
}

export default function ReviewForm({ targetId, onCreated }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setMsg("الرجاء اختيار تقييم"); return; }
    setSubmitting(true);
    try {
      const res = await reviewService.create(targetId, rating, comment || undefined);
      setMsg(res.message);
      setRating(0);
      setComment("");
      setTimeout(() => onCreated?.(), 1000);
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5">
      <h3 className="font-bold text-lg mb-3">تقييم</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-xl text-lg font-bold transition-all ${
                n <= rating ? "bg-amber-400 text-white scale-110 shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >★</button>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقاً (اختياري)"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" rows={3} />
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
        </Button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </form>
    </Card>
  );
}
