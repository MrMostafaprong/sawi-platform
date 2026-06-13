import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            منصة عربية للمواهب
          </div>
          <h1 className="text-4xl md:text-5xl font-cairo font-bold text-slate-900 mb-4">
            تواصل، تعاون،<br /><span className="text-primary">تألق</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
            سويّ هي منصة تجمع المواهب العربية، يمكنك بناء ملفّك المهني، اكتشاف مجموعات عمل، والتواصل مع المحترفين
          </p>
          <div className="flex items-center justify-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg">لوحة التحكم</Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg">انضم الآن</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">تسجيل دخول</Button>
                </Link>
              </>
            )}
            <Link to="/groups">
              <Button variant="ghost" size="lg">استعرض المجموعات</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 font-cairo">مميزات المنصة</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "ملف شخصي احترافي", desc: "أنشئ ملفًا يعرض مهاراتك، أعمالك، وتواصلك مع المحترفين", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
            { title: "مجموعات عمل", desc: "انضم إلى مجموعات حسب اهتماماتك، وتعاون مع الأعضاء في مشاريع مميزة", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
            { title: "تقييم ومراجعات", desc: "قم بتقييم المستخدمين وبناء سمعة مهنية تعكس مصداقيتك", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
          ].map((feature) => (
            <Card key={feature.title} className="p-6 text-center hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={feature.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
