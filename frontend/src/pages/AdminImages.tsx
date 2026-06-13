import { useEffect, useState } from "react";
import { adminService } from "../services/admin.service";
import type { PortfolioItem } from "../types";
import Button from "../components/Button";
import Card from "../components/Card";
import { PageSpinner } from "../components/Spinner";
import { getAssetUrl } from "../utils/assets";

export default function AdminImages() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p: number) => {
    setLoading(true);
    const data = await adminService.getPendingImages(p);
    setItems(data.items);
    setTotalPages(data.totalPages);
    setPage(data.page);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const handleApprove = async (id: string) => {
    await adminService.approveImage(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleReject = async (id: string) => {
    await adminService.rejectImage(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 font-cairo">الصور المعلقة</h1>
      <p className="text-slate-400 text-sm mb-8">مراجعة الصور المرفوعة قبل النشر</p>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">لا توجد صور معلقة</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.type === "IMAGE" && item.thumbnailUrl && (
                <img src={getAssetUrl(item.thumbnailUrl)} alt={item.caption || ""}
                  className="w-full h-48 object-cover" />
              )}
              <div className="p-4 space-y-3">
                {item.caption && <p className="text-sm text-slate-600">{item.caption}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" className="flex-1" onClick={() => handleApprove(item.id)}>موافقة</Button>
                  <Button size="sm" variant="danger" className="flex-1" onClick={() => handleReject(item.id)}>رفض</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
