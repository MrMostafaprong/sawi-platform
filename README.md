# سويّ (Sawi)

منصة عربية للمواهب والتعاون — يمكنك بناء ملف شخصي، اكتشاف مجموعات العمل، التواصل مع المحترفين، ونشر أعمالك.

## المميزات

- **الملف الشخصي** — صورة شخصية، مهارات، محفظة أعمال، روابط تواصل اجتماعي
- **المجموعات** — إنشاء مجموعات عامة/خاصة/للنساء فقط، انضمام ومغادرة، بحث متقدم
- **التقييمات** — تقييم المستخدمين (1-5) مع تعليقات
- **البلاغات** — الإبلاغ عن مستخدمين مخالفين
- **لوحة المشرف** — إدارة البلاغات، الصور المعلقة، حظر المستخدمين
- **التحكم في الخصوصية** — إظهار/إخفاء معلومات الاتصال
- **أمان** — JWT, CSRF, Rate Limiting, Helmet, CORS, Account Lockout

## التقنيات المستخدمة

### الواجهة الأمامية (Frontend)
- React 19 + TypeScript 6
- Vite 8
- Tailwind CSS v4
- React Router 7
- Axios
- TanStack React Query 5
- الخطوط: Tajawal + Cairo

### الواجهة الخلفية (Backend)
- Node.js + Express + TypeScript
- Prisma 7 + PostgreSQL
- JWT Authentication (httpOnly cookies)
- CSRF protection (csrf-csrf)
- Helmet, CORS, Rate Limiting
- Winston logging + Morgan
- Multer + Sharp + file-type (رفع الملفات)
- Bcrypt (12 rounds) + Account Lockout

## المتطلبات

- Node.js 20+
- PostgreSQL 16+
- npm

## التشغيل المحلي

### 1. إعداد قاعدة البيانات

```bash
# تأكد من تشغيل PostgreSQL على المنفذ 5432
createdb sawi_platform
```

أو استخدم Docker:

```bash
docker compose up postgres -d
```

### 2. إعداد البيئة

```bash
cd backend
cp .env.example .env
# عدّل .env حسب إعداداتك
```

### 3. تثبيت الاعتماديات والتشغيل

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx tsx src/server.ts
# الخادم يعمل على http://localhost:8000

# Frontend (نافذة أخرى)
cd frontend
npm install
npm run dev
# يعمل على http://localhost:5173 (مع Proxy للـ Backend)
```

### 4. فتح المتصفح

[http://localhost:5173](http://localhost:5173)

## المتغيرات البيئية (.env)

| المتغير | الشرح | القيمة الافتراضية |
|---|---|---|
| `DATABASE_URL` | رابط قاعدة البيانات | `postgresql://postgres:postgres@localhost:5432/sawi_platform` |
| `JWT_SECRET` | مفتاح JWT السري | (يجب تغييره) |
| `JWT_EXPIRES_IN` | مدة صلاحية التوكن | `7d` |
| `PORT` | منفذ الخادم | `8000` |
| `FRONTEND_URL` | رابط الواجهة الأمامية | `http://localhost:5173` |
| `NODE_ENV` | بيئة التشغيل | `development` |

## النشر (Production)

### باستخدام Docker

```bash
docker compose up -d --build
```

### الإعدادات الموصى بها للإنتاج

1. استخدم `NODE_ENV=production`
2. غيّر `JWT_SECRET` إلى قيمة عشوائية قوية
3. استخدم `SESSION_SECRET` لقيمة عشوائية
4. فعّل SSL عبر reverse proxy (Nginx/Caddy)
5. استخدم `FRONTEND_URL` مع HTTPS
6. اضبط معدل التحديد (Rate Limiting) حسب الحاجة
7. استخدم PostgreSQL مُدار (مثل AWS RDS، DigitalOcean Managed DB)
8. فعّل logging إلى خدمة مركزية (مثل Sentry، Papertrail)
9. استخدم Docker multi-stage builds لتقليل حجم الصورة

### SSL مع Nginx (مثال)

```nginx
server {
    listen 443 ssl;
    server_name sawi.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://localhost:8000;
    }

    location / {
        proxy_pass http://localhost:5173;
    }
}
```

## الأمان

راجع [SECURITY.md](./SECURITY.md) لمزيد من التفاصيل.

## المساهمة

نرحب بالمساهمات! يرجى فتح Issue أو Pull Request.

## الترخيص

MIT
