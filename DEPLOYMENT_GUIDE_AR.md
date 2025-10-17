# دليل نشر الدار العقارية على Render

## مقدمة
هذا الدليل يشرح خطوات نشر تطبيق الدار العقارية على منصة Render باستخدام GitHub. منصة Render هي خدمة استضافة سحابية حديثة توفر طريقة سهلة لنشر التطبيقات الويب.

## المتطلبات
1. حساب على GitHub
2. حساب على منصة Render
3. نسخة من كود المشروع (الذي تعمل عليه حالياً)

## خطوات النشر

### 1. إعداد مستودع GitHub
1. قم بإنشاء مستودع جديد على GitHub
   - انتقل إلى GitHub.com وقم بتسجيل الدخول
   - انقر على زر "New repository" لإنشاء مستودع جديد
   - أدخل اسماً للمستودع، مثل "aldar-real-estate"
   - اختر خيار عام (Public) أو خاص (Private) حسب تفضيلك
   - انقر على "Create repository"

2. قم برفع الكود إلى المستودع
   - افتح Terminal أو Command Prompt في مجلد المشروع
   - قم بتنفيذ الأوامر التالية:
     ```bash
     git init
     git add .
     git commit -m "النسخة الأولى"
     git branch -M main
     git remote add origin https://github.com/USERNAME/aldar-real-estate.git
     git push -u origin main
     ```
   - استبدل USERNAME باسم المستخدم الخاص بك على GitHub

### 2. الاتصال بـ Render
1. قم بإنشاء حساب على Render
   - انتقل إلى [render.com](https://render.com/) وقم بالتسجيل
   - يمكنك تسجيل الدخول مباشرة باستخدام حسابك على GitHub

2. قم بربط مستودع GitHub بحساب Render
   - بعد تسجيل الدخول، انقر على "Dashboard"
   - اختر "New" ثم "Web Service"
   - اختر "Build and deploy from a Git repository"
   - اختر مستودع GitHub الخاص بك من القائمة

### 3. إنشاء قاعدة بيانات PostgreSQL
1. على لوحة تحكم Render، انقر على "New +"
2. اختر "PostgreSQL" من قائمة الخدمات
3. أدخل المعلومات التالية:
   - Name: `aldar-postgres`
   - Database: `aldar_db`
   - User: `aldar_user`
4. اختر الخطة المناسبة لك (يوجد خطة مجانية للاختبار)
5. انقر على "Create Database"
6. احفظ عنوان اتصال قاعدة البيانات (Database URL) لاستخدامه لاحقاً

### 4. إنشاء خدمة الويب
1. على لوحة تحكم Render، انقر على "New +" مرة أخرى
2. اختر "Web Service"
3. حدد مستودع GitHub الخاص بك
4. أدخل المعلومات التالية:
   - Name: `aldar-real-estate`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. في قسم "Environment Variables"، أضف المتغيرات التالية:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (الصق عنوان اتصال قاعدة البيانات الذي حصلت عليه من الخطوة السابقة)
6. انقر على "Create Web Service"

### 5. النشر باستخدام Blueprint (اختياري)
بدلاً من إتباع الخطوات 3 و 4 بشكل منفصل، يمكنك استخدام ملف `render.yaml` الموجود في المشروع:
1. على لوحة تحكم Render، انقر على "New +" ثم "Blueprint"
2. اختر مستودع GitHub الخاص بك
3. سيقوم Render تلقائياً بإنشاء قاعدة البيانات وخدمة الويب وفقاً للإعدادات المحددة في ملف render.yaml

### 6. تهيئة قاعدة البيانات
بعد نشر التطبيق بنجاح:
1. انتقل إلى تفاصيل خدمة الويب في Render
2. انتقل إلى علامة التبويب "Shell"
3. قم بتنفيذ الأمر: `npm run db:push`
4. هذا سينشئ الجداول المطلوبة في قاعدة البيانات

## اختبار التطبيق
بعد اكتمال عملية النشر:
1. انقر على رابط التطبيق الذي تم إنشاؤه (عادة يكون بالشكل `https://aldar-real-estate.onrender.com`)
2. تأكد من أن جميع الوظائف تعمل بشكل صحيح
3. يمكنك تسجيل الدخول إلى لوحة التحكم باستخدام:
   - اسم المستخدم: `admin`
   - كلمة المرور: `admin123`

## استكشاف الأخطاء وإصلاحها
إذا واجهت أي مشاكل:
1. تحقق من سجلات التطبيق في Render (Logs)
2. تأكد من أن جميع المتغيرات البيئية تم إعدادها بشكل صحيح
3. تأكد من أن قاعدة البيانات متصلة بشكل صحيح
4. جرب إعادة تشغيل الخدمة من لوحة التحكم

### حل مشكلة "Could not resolve ../vite.config"
إذا واجهت خطأ يتعلق بحل ملف vite.config أثناء عملية البناء، فقد قمنا بإنشاء حل كامل لهذه المشكلة:

1. تأكد من وجود الملفات التالية في المستودع:
   - `vite.config.js` - ملف التكوين الأصلي
   - `vite.config.cjs` - نسخة CommonJS متوافقة مع نظام require
   - `server/vite.fixed.ts` - نسخة معدلة من ملف vite.ts تستخدم استيراد متوافق
   - `build-render.sh` - سكريبت مخصص لعملية البناء
   - `.node-version` - محدد إصدار Node.js

2. تأكد من أن ملف `render.yaml` يستخدم السكريبت المخصص في أمر البناء:
   ```yaml
   buildCommand: chmod +x build-render.sh && ./build-render.sh
   ```

3. كيف يعمل الحل؟
   - يقوم السكريبت بإنشاء نسخ متعددة من ملف التكوين بصيغ مختلفة (.js, .mjs, .ts, .cjs)
   - يقوم بتعديل كيفية استيراد ملف التكوين في server/vite.ts باستخدام طريقة require المتوافقة
   - ينسخ جميع الملفات الضرورية إلى مجلد التوزيع (dist) للتأكد من أن الاستيراد سيعمل في بيئة الإنتاج

4. للتحقق من هذا الحل، يمكنك اختبار تنفيذ السكريبت محلياً:
   ```bash
   chmod +x build-render.sh
   ./build-render.sh
   ```

### حل مشكلة فقدان الألوان الخضراء في Render
إذا لاحظت أن الألوان الخضراء المستخدمة في النظام تظهر على Replit ولكنها مفقودة على Render، فهذا يرجع إلى مشكلة في معالجة ملف theme.json:

1. تأكد من أن ملفات التكوين (`vite.config.js` و `vite.config.cjs`) تحتوي على إضافة `@replit/vite-plugin-shadcn-theme-json`:
   ```javascript
   // في vite.config.js
   import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
   
   // في plugins:
   plugins: [
     react(),
     themePlugin()
   ]
   
   // في vite.config.cjs
   const themePlugin = require("@replit/vite-plugin-shadcn-theme-json").default;
   
   // في plugins:
   plugins: [
     require('@vitejs/plugin-react')(),
     themePlugin()
   ]
   ```

2. تأكد من أن ملف `build-render.sh` ينسخ ملف theme.json إلى مجلد التوزيع:
   ```bash
   # نسخ ملف theme.json للتأكد من أن الألوان ستظهر بشكل صحيح
   cp theme.json dist/
   cp theme.json dist/server/
   ```

3. إذا كنت لا ترى الألوان بعد التحديث، جرب إعادة بناء التطبيق من لوحة تحكم Render عن طريق النقر على زر "Manual Deploy" واختيار "Clear build cache & deploy".

## ملاحظات هامة
- تأكد من تغيير كلمة مرور المستخدم الافتراضي (admin) بعد أول تسجيل دخول
- للتعديل على التطبيق، قم بتحديث الكود في مستودع GitHub وسيقوم Render تلقائياً بإعادة بناء ونشر التطبيق
- تذكر أن الخطة المجانية في Render قد تكون محدودة وقد تحتاج للترقية للحصول على أداء أفضل للتطبيقات الإنتاجية