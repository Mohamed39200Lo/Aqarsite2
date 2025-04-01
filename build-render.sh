#!/bin/bash
# سكريبت بناء مخصص لـ Render

# تثبيت التبعيات
npm install

# نسخ ملف التكوين لتجنب مشكلة الاستيراد
cp vite.config.js vite.config.mjs

# تنفيذ عملية البناء للواجهة الأمامية
npx vite build

# بناء ملفات الخادم
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# نسخ ملفات تكوين إضافية
cp -r shared dist/
cp -r attached_assets dist/
cp vite.config.mjs dist/vite.config.js

echo "تمت عملية البناء بنجاح!"