import { Link } from "react-router-dom";
import Card from "../components/Card";

export default function Admin() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 font-cairo">لوحة المشرف</h1>
      <p className="text-slate-400 text-sm mb-8">إدارة المنصة والإشراف على المحتوى</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/reports">
          <Card className="p-6 text-center hover:-translate-y-1 transition-all duration-200" hover>
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h2 className="font-bold text-slate-800">التقارير</h2>
            <p className="text-sm text-slate-400 mt-1">إدارة البلاغات المقدمة</p>
          </Card>
        </Link>
        <Link to="/admin/images">
          <Card className="p-6 text-center hover:-translate-y-1 transition-all duration-200" hover>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <h2 className="font-bold text-slate-800">الصور</h2>
            <p className="text-sm text-slate-400 mt-1">مراجعة الصور المرفوعة</p>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card className="p-6 text-center hover:-translate-y-1 transition-all duration-200" hover>
            <div className="w-12 h-12 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h2 className="font-bold text-slate-800">المستخدمين</h2>
            <p className="text-sm text-slate-400 mt-1">إدارة المستخدمين والحظر</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
