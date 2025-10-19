# สถาปัตยกรรมแอปพลิเคชันเช่ารถขนาดเล็ก

## 1. ภาพรวมเทคสแต็ก

- **Frontend / Backend:** Next.js 14 (React + TypeScript) พร้อม App Router ใช้ Server Actions และ API Routes สำหรับลอจิกฝั่งเซิร์ฟเวอร์ได้ภายในโค้ดเบสเดียว
- **UI Toolkit:** Tailwind CSS เพื่อจัดสไตล์รวดเร็ว; อาจเสริม DaisyUI หรือ Headless UI สำหรับฟอร์มและตาราง
- **State & Data:** ใช้ Supabase JavaScript client (`@supabase/supabase-js`) ทั้งในฝั่งเบราว์เซอร์และ Server Components
- **Authentication:** Supabase Auth (อีเมล/รหัสผ่าน และ Social Login หากต้องการ)
- **Database:** Supabase PostgreSQL (แบบโฮสต์) จัดการสคีมา นโยบาย RLS และวิวผ่าน SQL Editor หรือไฟล์ migration ในโปรเจกต์
- **Reporting:** สร้าง SQL Views หรือ Materialized Views บน Supabase แล้วดึงข้อมูลผ่าน Server Components หรือ REST Endpoint เพื่อทำรายงาน/ส่งออก PDF, CSV
- **Deployment:** Deploy Next.js ไปที่ Vercel; งานเบื้องหลัง/ตั้งเวลาใช้ Supabase Edge Functions หรือ Cron ของ Supabase; หน้าเว็บดึงข้อมูลผ่าน HTTPS

## 2. โมเดลเอนทิตี (อย่างน้อย 6 เอนทิตี)

| เอนทิตี                 | วัตถุประสงค์                                                        |
|-------------------------|-----------------------------------------------------------------------|
| `branches`              | สาขาที่ใช้รับ/คืนรถ                                                   |
| `employees`             | บัญชีพนักงานและบทบาท (ผู้จัดการ, เจ้าหน้าที่เช่า, ช่าง)             |
| `customers`             | ลูกค้าที่ลงทะเบียนพร้อมข้อมูลใบขับขี่                               |
| `vehicle_categories`    | ประเภทของรถ (Compact/SUV ฯลฯ) สำหรับกำหนดราคาและเงื่อนไข            |
| `cars`                  | รถในฟลีทรถพร้อมสถานะ ปัจจุบัน เลขไมล์ สาขา ประเภท                   |
| `rental_contracts`      | สัญญาเช่าเชื่อมลูกค้า รถ สาขา วันรับ-คืน                           |
| `payments`              | รายการชำระเงิน (มัดจำ ค่าเช่า ค่าปรับ)                               |
| `maintenance_records`   | ประวัติซ่อมบำรุงแต่ละคัน (ตามกำหนด ซ่อม ทำความสะอาด)               |
| `rental_inspections`    | ใบตรวจสอบสภาพตอนรับ/คืนรถ รูปภาพ ความเสียหาย                       |

> _สามารถเพิ่มหรือลดเอนทิตีได้ตามขอบเขตงาน แต่ควรรักษาให้มีอย่างน้อยหกตารางที่มีความสัมพันธ์กันตามเงื่อนไขของงานวิชา_

## 3. โครงสร้างฐานข้อมูล Supabase (DDL)

รัน SQL ด้านล่างใน Supabase (ผ่าน SQL Editor หรือไฟล์ migration) เพื่อสร้างตาราง ความสัมพันธ์ และฐานสำหรับรายงาน

```sql
create schema if not exists car_rental;
set search_path to car_rental;

-- Branches
create table car_rental.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- Employees
create table car_rental.employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users on delete set null,
  branch_id uuid references car_rental.branches on delete set null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('manager','rental_agent','mechanic','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customers
create table car_rental.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text not null,
  driver_license_no text not null,
  driver_license_expiry date not null,
  date_of_birth date not null,
  created_at timestamptz not null default now()
);

-- Vehicle Categories
create table car_rental.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  daily_rate numeric(12,2) not null,
  weekly_rate numeric(12,2),
  monthly_rate numeric(12,2),
  required_deposit numeric(12,2),
  created_at timestamptz not null default now()
);

-- Cars
create table car_rental.cars (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references car_rental.vehicle_categories on delete restrict,
  branch_id uuid references car_rental.branches on delete set null,
  registration_no text unique not null,
  vin text unique,
  make text not null,
  model text not null,
  year int not null,
  color text,
  mileage int not null default 0,
  status text not null check (status in ('available','reserved','rented','maintenance','retired')) default 'available',
  created_at timestamptz not null default now()
);

-- Rental Contracts
create table car_rental.rental_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_no text unique not null,
  customer_id uuid not null references car_rental.customers on delete cascade,
  car_id uuid not null references car_rental.cars on delete restrict,
  pickup_branch_id uuid references car_rental.branches on delete set null,
  return_branch_id uuid references car_rental.branches on delete set null,
  employee_id uuid references car_rental.employees on delete set null,
  pickup_datetime timestamptz not null,
  return_datetime timestamptz not null,
  actual_return_datetime timestamptz,
  rental_status text not null check (rental_status in ('pending','active','completed','cancelled','overdue')) default 'pending',
  daily_rate numeric(12,2) not null,
  total_days int generated always as (greatest(ceil((extract(epoch from (return_datetime - pickup_datetime)) / 86400)),1)) stored,
  subtotal numeric(12,2) generated always as (
    daily_rate * greatest(
      ceil((extract(epoch from (return_datetime - pickup_datetime)) / 86400))::numeric,
      1::numeric
    )
  ) stored,
  discount numeric(12,2) default 0,
  late_fee numeric(12,2) default 0,
  total_amount numeric(12,2) generated always as (
    daily_rate * greatest(
      ceil((extract(epoch from (coalesce(actual_return_datetime, return_datetime) - pickup_datetime)) / 86400))::numeric,
      1::numeric
    )
    - discount + late_fee
  ) stored,
  notes text,
  created_at timestamptz not null default now()
);

-- Payments
create table car_rental.payments (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references car_rental.rental_contracts on delete cascade,
  payment_date timestamptz not null default now(),
  payment_method text not null check (payment_method in ('cash','credit_card','debit_card','bank_transfer','e_wallet')),
  amount numeric(12,2) not null,
  payment_type text not null check (payment_type in ('deposit','rental_fee','late_fee','refund')),
  reference_no text,
  received_by uuid references car_rental.employees on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- Maintenance Records
create table car_rental.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references car_rental.cars on delete cascade,
  maintenance_date date not null,
  odometer int,
  maintenance_type text not null check (maintenance_type in ('scheduled','repair','cleaning','inspection')),
  cost numeric(12,2) default 0,
  performed_by uuid references car_rental.employees on delete set null,
  description text,
  created_at timestamptz not null default now()
);

-- Rental Inspections (pickup & return checklists)
create table car_rental.rental_inspections (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references car_rental.rental_contracts on delete cascade,
  inspection_type text not null check (inspection_type in ('pickup','return')),
  inspection_datetime timestamptz not null default now(),
  odometer int,
  fuel_level_percent int check (fuel_level_percent between 0 and 100),
  damages jsonb default '[]'::jsonb,
  notes text,
  inspected_by uuid references car_rental.employees on delete set null,
  created_at timestamptz not null default now()
);

-- Index to fetch active rentals per car quickly
create index on car_rental.rental_contracts (car_id, rental_status);

-- Example row level security (enable and then add policies as needed)
alter table car_rental.customers enable row level security;
create policy "Customers can view own profile"
  on car_rental.customers for select
  using (auth.uid() = id);
-- Add admin policies via Supabase Dashboard based on auth.roles, custom claims, or employees table

```

## 4. รายงาน (อย่างน้อย 5 รายงาน)

ตัวอย่าง SQL สำหรับสร้าง Materialized View เพื่อใช้ทำรายงาน ซึ่งสามารถตั้ง Cron ของ Supabase (pg_net) เพื่อ Refresh อัตโนมัติ หรือสั่งเองตามต้องการ

```sql
-- 1. Revenue per period
create materialized view car_rental.mv_revenue_by_period as
select
  date_trunc('month', payment_date) as period,
  sum(case when payment_type = 'rental_fee' then amount else 0 end) as rental_income,
  sum(case when payment_type = 'late_fee' then amount else 0 end) as late_fee_income,
  sum(case when payment_type = 'deposit' then amount else 0 end) as deposits,
  sum(case when payment_type = 'refund' then amount else 0 end) as refunds,
  sum(amount) as total_income
from car_rental.payments
group by 1
order by 1 desc;

-- 2. Car utilization (percentage of days rented within the last 90 days)
create materialized view car_rental.mv_car_utilization as
with rental_days as (
  select
    car_id,
    coalesce(
      sum(
        greatest(
          0::double precision,
          ceil(
            extract(
              epoch from
              least(coalesce(actual_return_datetime, return_datetime), now())
              - greatest(pickup_datetime, now() - interval '90 days')
            ) / 86400
          )
        )
      ),
      0
    )::int as rented_days
  from car_rental.rental_contracts
  where pickup_datetime >= now() - interval '90 days'
  group by 1
)
select
  c.id as car_id,
  c.registration_no,
  c.make,
  c.model,
  rental_days.rented_days,
  90 as period_days,
  round((rental_days.rented_days::numeric / 90) * 100, 2) as utilization_percent
from car_rental.cars c
left join rental_days on rental_days.car_id = c.id;

-- 3. Top repeat customers
create materialized view car_rental.mv_top_customers as
select
  customer_id,
  count(*) as rental_count,
  sum(total_amount) as total_spent,
  min(pickup_datetime) as first_rental,
  max(return_datetime) as last_rental
from car_rental.rental_contracts
where rental_status in ('completed','overdue')
group by 1
order by rental_count desc;

-- 4. Maintenance history
create materialized view car_rental.mv_maintenance_history as
select
  car_id,
  count(*) as total_jobs,
  sum(cost) as total_cost,
  max(maintenance_date) as last_service_date
from car_rental.maintenance_records
group by 1;

-- 5. Overdue rentals
create materialized view car_rental.mv_overdue_rentals as
select
  rc.id as rental_id,
  rc.contract_no,
  rc.customer_id,
  rc.car_id,
  rc.return_datetime,
  now() as current_time,
  extract(day from now() - rc.return_datetime)::int as overdue_days,
  rc.late_fee
from car_rental.rental_contracts rc
where rc.rental_status = 'overdue'
order by overdue_days desc;

```

หากต้องการข้อมูลแบบเรียลไทม์สำหรับแดชบอร์ด สามารถปรับเป็น View ปกติ หรือใช้คำสั่ง SQL เดิมใน API Routes ของ Next.js ได้

## 5. กรณีการใช้งานหลักของระบบ

1. **จัดการพนักงาน:** ผู้จัดการเชิญพนักงานเข้าสู่ระบบผ่าน Supabase Auth และกำหนดบทบาท
2. **จัดการฟลีทรถ:** ช่างหรือเจ้าหน้าที่ปรับสถานะรถ บันทึกประวัติซ่อมบำรุง
3. **กระบวนการจอง/ทำสัญญา:** เจ้าหน้าที่เช่าสร้างสัญญา สำรองรถ บันทึกผลตรวจรับ และรับเงินมัดจำ/ค่าเช่า
4. **กระบวนการคืนรถ:** เจ้าหน้าที่ตรวจสภาพรถตอนคืน คำนวณค่าปรับ (ถ้ามี) ปิดสัญญา และบันทึกการชำระเงิน
5. **แดชบอร์ดรายงาน:** ผู้จัดการกรองข้อมูลตามสาขา/ช่วงเวลา ส่งออกเป็น PDF หรือ CSV

## 6. โครงสร้างโปรเจกต์ (Next.js)

```
car-rental/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                      # Dashboard overview
│  ├─ rentals/
│  │  ├─ page.tsx                   # Rentals list
│  │  └─ [id]/page.tsx              # Rental detail + actions
│  ├─ cars/                         # Car list + maintenance
│  ├─ customers/                    # Customer CRM
│  ├─ reports/
│  │  ├─ page.tsx                   # Reports overview
│  │  ├─ revenue/page.tsx
│  │  ├─ utilization/page.tsx
│  │  └─ overdue/page.tsx
│  └─ api/                          # API routes if needed
├─ lib/
│  ├─ supabase/server.ts            # createServerClient helper
│  ├─ supabase/client.ts            # browser client
│  ├─ auth.ts                       # role helpers
│  └─ validators/                   # zod schemas
├─ components/
│  ├─ forms/
│  ├─ tables/
│  └─ charts/
├─ scripts/                         # Supabase migration runner, seed scripts
├─ supabase/
│  ├─ migrations/
│  └─ seed/
├─ docs/
│  └─ architecture.md
├─ .env.local.example
├─ package.json
└─ README.md
```

## 7. แผนการพัฒนา

1. **ตั้งค่าโปรเจกต์:** รัน `npx create-next-app@latest` (เลือก TypeScript, Tailwind, ESLint)
2. **เชื่อมต่อ Supabase:** ติดตั้ง `@supabase/supabase-js` เพิ่มไฟล์ `.env` ที่กำหนด `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` และ Service Role Key สำหรับ Server Actions
3. **พัฒนาฟังก์ชันหลัก:**
   - หน้ารายชื่อลูกค้า และฟอร์มเพิ่ม/แก้ไข
   - หน้าจัดการรถ (ปรับสถานะ บันทึกซ่อมบำรุง)
   - กระบวนการทำสัญญา (เลือกคน+รถ กำหนดวัน ราคา หน้ารายละเอียดสัญญา)
   - โมดูลชำระเงินที่ผูกกับสัญญา
4. **หน้ารายงาน:** ดึงข้อมูลจาก materialized view แสดงกราฟ (Recharts/Chart.js)
5. **ความปลอดภัย:** ตั้งนโยบาย RLS ป้องกันตาราง ใช้ session ของ Supabase Auth ใน Next.js middleware เพื่อกำหนดสิทธิ์
6. **การทดสอบ:** เขียน unit test สำหรับลอจิกคำนวณราคา และ integration test สำหรับ flow หลัก (Playwright หรือ Cypress)
7. **ดีพลอย:** ส่ง Next.js ไป Vercel ตั้งค่า env ของ Supabase และตั้งเวลาการ Refresh View รายวันผ่าน Supabase Edge Functions หรือ pg_net cron

## 8. ขั้นตอนถัดไป

- ยืนยันขอบเขตฟีเจอร์ (เช่น ต้องการใบแจ้งหนี้หรืออัปโหลดรูปความเสียหายของรถ? Supabase Storage รองรับรูปภาพได้)
- ตัดสินใจเรื่องภาษาของระบบ (ไทย/อังกฤษ) และการแปลหน้าจอ
- เตรียมสคริปต์ seed ข้อมูลตัวอย่างสำหรับสาธิต
- เริ่มสร้างคอมโพเนนต์ UI ตามโครงสร้างหน้าในข้อ 6

> เมื่อพร้อมเริ่มโค้ด ให้รัน `create-next-app` บนเครื่อง (จำเป็นต้องมีอินเทอร์เน็ต) แล้วคัดลอก SQL Schema ด้านบนไปใช้ใน Supabase หากต้องการตัวอย่างโค้ดเริ่มต้นหรือคอมโพเนนต์เพิ่มเติมแจ้งได้เลย
