import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-8xl font-extrabold text-primary/20 font-cairo mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">عذراً، الصفحة غير موجودة</h1>
      <p className="text-slate-500 mb-8">الصفحة التي تبحث عنها قد تكون أُزيلت أو غير متوفرة</p>
      <Link to="/"
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        العودة للرئيسية
      </Link>
    </div>
  );
}
