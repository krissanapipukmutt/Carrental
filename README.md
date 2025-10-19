<<<<<<< HEAD
# Carrental
Short paper
=======
# Car Rental Manager (Short Paper)

แอปพลิเคชันเว็บสำหรับจัดการธุรกิจเช่ารถขนาดเล็ก พัฒนาเพื่อประกอบงาน Short Paper ระดับบัณฑิตศึกษา ประกอบด้วยการจัดการฟลีทรถ ลูกค้า สัญญาเช่า การชำระเงิน และแดชบอร์ดรายงานจาก Supabase

## เทคโนโลยีหลัก

- Next.js 15 (App Router, TypeScript, Server Actions)
- Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Storage)
- Zod (validation)

## เริ่มต้นใช้งาน

1. ติดตั้ง dependencies
   ```bash
   npm install
   ```
2. คัดลอกไฟล์ตัวอย่างสิ่งแวดล้อม
   ```bash
   cp .env.local.example .env.local
   ```
   จากนั้นเติมค่า `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` จากโปรเจกต์ Supabase ของคุณ
3. รันเซิร์ฟเวอร์พัฒนา
   ```bash
   npm run dev
   ```
4. เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูหน้าจอแดชบอร์ดต้นแบบ

## โครงสร้างโปรเจกต์

- `app/` – หน้าแดชบอร์ดหลัก, สัญญาเช่า, ลูกค้า, รถ, รายงาน
- `lib/supabase/` – helper สำหรับเชื่อมต่อ Supabase (browser/server/admin)
- `components/` – UI components รวมถึง shell layout
- `supabase/` – ที่เก็บไฟล์ migration/seed (เตรียมสำหรับต่อกับ Supabase CLI)
- `docs/architecture.md` – เอกสารออกแบบระบบและคำสั่ง SQL schema/รายงาน

## เชื่อมต่อฐานข้อมูล

1. สร้างโปรเจกต์ใน [Supabase](https://supabase.com/)
2. รันคำสั่ง SQL ใน `docs/architecture.md` เพื่อสร้างตารางและ materialized views
3. ใช้คำสั่ง Supabase CLI เพื่อสร้างประเภทข้อมูล TypeScript
   ```bash
   npx supabase gen types typescript --project-id <project-id> --schema public > lib/supabase/types.ts
   ```
4. อัปเดต Server Actions หรือ Route Handlers ให้ดึงข้อมูลจริงมาแสดงในหน้าแต่ละส่วน

## รายงานที่รองรับ

1. รายได้ตามช่วงเวลา (`mv_revenue_by_period`)
2. อัตราการใช้งานรถ (`mv_car_utilization`)
3. ลูกค้าที่เช่าบ่อย (`mv_top_customers`)
4. ประวัติซ่อมบำรุง (`mv_maintenance_history`)
5. สัญญาเช่าค้างคืน (`mv_overdue_rentals`)

แต่ละหน้ารายงานมีโครงร่างพร้อมคำอธิบายว่าจะเชื่อมต่อกับ view ใดใน Supabase

## ขั้นตอนถัดไปที่แนะนำ

- พัฒนาฟอร์มและ Server Actions สำหรับการสร้าง/แก้ไขข้อมูลจริง
- เพิ่มการยืนยันตัวตนด้วย Supabase Auth และกำหนดสิทธิ์ตามบทบาท
- เชื่อมต่อแดชบอร์ดกับข้อมูลจริง พร้อม export CSV/PDF
- ตั้งค่า CRON หรือ Edge Functions สำหรับรีเฟรช materialized view และการแจ้งเตือน
