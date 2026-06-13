# سياسة الأمان - سويّ (Sawi)

## الإجراءات الأمنية المطبقة

### المصادقة (Authentication)
- **JWT** في httpOnly cookies — غير قابل للوصول من JavaScript
- **Bcrypt** 12 round لتشفير كلمات المرور
- **تأمين الحساب** — 5 محاولات فاشلة → قفل 15 دقيقة
- **حظر الحساب** — يمكن للمشرف حظر المستخدمين المخالفين

### الحماية من الهجمات

| الهجوم | الإجراء |
|---|---|
| CSRF | توثيق مزدوج (Double-submit cookie) عبر `csrf-csrf` |
| XSS | Helmet + httpOnly cookies + عدم إدخال HTML |
| Clickjacking | `X-Frame-Options` من Helmet |
| هجمات القوة الغاشمة | Rate Limiting (100/15 دقيقة عام، 20/15 دقيقة للمصادقة) |
| MIME sniffing | `X-Content-Type-Options` من Helmet |
| هجمات رفع الملفات | فحص MIME عبر `file-type` بعد الرفع + Sharp لضغط الصور |
| SQL Injection | Prisma (parameterized queries) |
| تسمم الـ DNS | Helmet DNS prefetch control |
| هجمات MITM | HTTPS في الإنتاج + HSTS عبر Helmet |
| فك تشفير JWT | توقيع باستخدام `JWT_SECRET` قوي |

### CORS
- يسمح فقط بطلب من `FRONTEND_URL`
- `credentials: true` للسماح بالكوكيز

### تسجيل الدخول
- **Winston** — تسجيل في ملفات `logs/combined.log` و `logs/error.log`
- **Morgan** — تسجيل طلبات HTTP بنفس تنسيق Winston
- في الإنتاج، يُفضل إرسال logs إلى خدمة مركزية

## تقارير الثغرات الأمنية

إذا اكتشفت ثغرة أمنية، من فضلك:
1. لا تنشرها علناً
2. أرسل تقريراً مفصلاً إلى `security@sawi.example.com`
3. سنقوم بالرد خلال 48 ساعة

## التبعيات والمراجعة

- يتم تحديث التبعيات بشكل دوري
- يُرجى تشغيل `npm audit` قبل كل نشر
- يُفضل استخدام Snyk أو Dependabot لمراقبة الثغرات

## ممارسات آمنة للمطورين

- لا تشارك `JWT_SECRET` أو `SESSION_SECRET` في الكود أو Git
- استخدم `.env` للمتغيرات الحساسة
- افحص صلاحية CSRF token لكل طلب غير GET
- لا تثق في بيانات المستخدم — تحقق دائماً من صحة المدخلات
- استخدم `express-validator` لكل نقطة نهاية
- قلّل صلاحية JWT (7 أيام افتراضياً، قللها في الإنتاج)

## الإبلاغ

للإبلاغ عن مشكلة أمان أو انتهاك للخصوصية:
- GitHub Issues: https://github.com/your-org/sawi/issues
- البريد: `security@sawi.example.com`
