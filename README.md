# الدار العقارية - Aldar Real Estate

موقع عقاري شامل للعقارات السعودية مع لوحة تحكم إدارية ودعم اللغة العربية.

A comprehensive real estate website for Saudi properties with admin dashboard and Arabic language support.

## تشغيل المشروع على Render باستخدام GitHub

### الخطوات:

1. **انشاء مستودع على GitHub:**
   - قم بإنشاء مستودع جديد على GitHub
   - قم برفع هذا المشروع إلى المستودع

2. **إنشاء حساب على Render:**
   - قم بالتسجيل في [Render](https://render.com/)
   - يمكنك استخدام حساب GitHub للتسجيل

3. **إنشاء قاعدة البيانات PostgreSQL:**
   - من لوحة التحكم في Render، انقر على "New +"
   - اختر "PostgreSQL"
   - أدخل اسم قاعدة البيانات: `aldar-postgres`
   - أدخل اسم المستخدم: `aldar_user`
   - أدخل اسم قاعدة البيانات: `aldar_db`
   - اختر الخطة المناسبة لك
   - انقر على "Create Database"

4. **نشر التطبيق:**
   - من لوحة التحكم في Render، انقر على "New +"
   - اختر "Web Service"
   - اختر مستودع GitHub الخاص بك
   - أدخل اسم للخدمة: `aldar-real-estate`
   - تأكد من أن البيئة هي: `Node`
   - أمر البناء: `chmod +x build-render.sh && ./build-render.sh`
   - أمر البدء: `npm run start`
   - في قسم "Environment Variables"، أضف:
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = [انسخ رابط الاتصال من قاعدة البيانات التي أنشأتها]
   - انقر على "Create Web Service"

5. **اختياري: استخدام نشر Blueprint:**
   - بدلاً من الخطوات 3 و 4 يمكنك استخدام ملف `render.yaml` الموجود في المشروع
   - من لوحة التحكم في Render، انقر على "New +" ثم "Blueprint"
   - اختر مستودع GitHub الخاص بك
   - سيقوم Render تلقائيًا بإنشاء قاعدة البيانات والتطبيق

6. **تهيئة قاعدة البيانات:**
   - بعد إطلاق الخدمة بنجاح، قم بتشغيل أمر لتهيئة قاعدة البيانات:
   - انتقل إلى "Shell" في تفاصيل الخدمة الويب
   - قم بتنفيذ: `npm run db:push`

## حل مشكلة "Could not resolve ../vite.config"

تم إضافة حل متكامل لهذه المشكلة في الإصدار الحالي باستخدام:
- ملف `build-render.sh` لضمان تجهيز البيئة بشكل صحيح
- ملف `vite.config.cjs` للتوافق مع CommonJS
- ملف `server/vite.fixed.ts` لتصحيح عملية الاستيراد
- تأكد من استخدام أمر البناء المحدث: `chmod +x build-render.sh && ./build-render.sh`

## صلاحيات الإدارة

استخدم بيانات الاعتماد التالية للدخول إلى لوحة التحكم الإدارية:

- اسم المستخدم: `admin`
- كلمة المرور: `admin123`

## تطوير المشروع محليًا

```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev
```

يعمل الخادم على منفذ 5000: http://localhost:5000

## التقنيات المستخدمة

- **الواجهة الأمامية:** React، Tailwind CSS، shadcn/ui
- **الخادم:** Express.js
- **قاعدة البيانات:** PostgreSQL مع Drizzle ORM
- **المصادقة:** Passport.js
