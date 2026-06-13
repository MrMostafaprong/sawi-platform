import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { to: "/groups", label: "المجموعات" },
  { to: "/search", label: "بحث" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-red-900/30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary dark:text-red-500 font-cairo font-bold text-xl hover:text-primary-dark dark:hover:text-red-400 transition-colors">
            <svg width="28" height="28" viewBox="0 0 48 46" fill="none" className="text-primary dark:text-red-500">
              <path fill="currentColor" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
            </svg>
            سويّ
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(link.to)
                    ? "bg-primary-50 text-primary dark:bg-red-900/30 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-red-900/20 hover:text-slate-900 dark:hover:text-red-300"
                }`}
              >{link.label}</Link>
            ))}
            {user && (
              <Link to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/dashboard"
                    ? "bg-primary-50 text-primary dark:bg-red-900/30 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-red-900/20 hover:text-slate-900 dark:hover:text-red-300"
                }`}
              >لوحة التحكم</Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-red-400 transition-colors" title={dark ? "الوضع النهاري" : "الوضع الليلي"}>
              {dark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">{user.displayName || user.username}</span>
                <button onClick={logout}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">تسجيل خروج</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-primary dark:text-red-400 hover:text-primary-dark dark:hover:text-red-300 transition-colors">دخول</Link>
                <Link to="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-primary dark:bg-red-600 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-red-700 transition-colors">تسجيل</Link>
              </div>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-red-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-red-900/30 bg-white dark:bg-black px-4 py-3 space-y-1 animate-fade-in">
            <button onClick={() => setDark(!dark)} className="flex items-center gap-2 w-full text-right px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-red-900/20">
              {dark ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}
              {dark ? "الوضع النهاري" : "الوضع الليلي"}
            </button>
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-red-900/20">{link.label}</Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-red-900/20">لوحة التحكم</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="block w-full text-right px-3 py-2 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">تسجيل خروج</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary dark:text-red-400 hover:bg-primary-50 dark:hover:bg-red-900/20">دخول</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary dark:text-red-400 hover:bg-primary-50 dark:hover:bg-red-900/20">تسجيل</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 dark:border-red-900/30 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
          سويّ &copy; {new Date().getFullYear()} &mdash; منصة عربية للمواهب والتعاون
        </div>
      </footer>
    </div>
  );
}
