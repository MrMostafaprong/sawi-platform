import { useEffect, useState } from "react";
import { adminService } from "../services/admin.service";
import type { Report } from "../types";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { PageSpinner } from "../components/Spinner";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p: number) => {
    setLoading(true);
    const data = await adminService.getPendingReports(p);
    setReports(data.reports);
    setTotalPages(data.totalPages);
    setPage(data.page);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const handleAction = async (id: string, action: "RESOLVED" | "DISMISSED") => {
    await adminService.resolveReport(id, action);
    load(page);
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 font-cairo">التقارير</h1>
      <p className="text-slate-400 text-sm mb-8">إدارة البلاغات المقدمة من المستخدمين</p>

      {reports.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">لا توجد تقارير معلقة</Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="danger">{r.reason}</Badge>
                    <Badge variant="warning">معلق</Badge>
                  </div>
                  <p className="text-sm">
                    <strong>مُبلّغ:</strong> {r.reporter?.username} &middot;
                    <strong> ضد:</strong> {r.target.username} ({r.target.email})
                  </p>
                  {r.description && <p className="text-sm text-slate-500 mt-2">{r.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="primary" onClick={() => handleAction(r.id, "RESOLVED")}>حل</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleAction(r.id, "DISMISSED")}>رفض</Button>
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
