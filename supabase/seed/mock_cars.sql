-- ตัวอย่างข้อมูลสำหรับ entity ที่เกี่ยวข้องกับรถ
-- สามารถนำไปรันใน Supabase SQL Editor หรือ CLI: supabase db remote commit

begin;

insert into public.branches (id, name, address, phone)
values
  ('b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401', 'สาขาบางนา', '888 ถนนสุขุมวิท แขวงบางนา กรุงเทพมหานคร 10260', '02-123-4567'),
  ('30b6e6b3-9957-4dec-9110-1a227af18d1d', 'สาขาหัวหมาก', '99 ถนนหัวหมาก แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240', '02-765-4321'),
  ('6a1c93fd-6cf8-4e8d-9c5b-7525302894f1', 'สาขาขอนแก่น', '55 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น 40000', '043-222-111')
on conflict (id) do nothing;

insert into public.employees (
  id,
  auth_user_id,
  branch_id,
  first_name,
  last_name,
  email,
  phone,
  role,
  active
)
values
  (
    'd016f6ab-7e24-49bb-8060-6f36d2cb8c3f',
    null,
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    'ภานุ',
    'สมบูรณ์',
    'phanu.manager@carrental.local',
    '090-123-4567',
    'manager',
    true
  ),
  (
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a',
    null,
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    'สุรีย์',
    'ช่างดี',
    'suree.mechanic@carrental.local',
    '081-765-4321',
    'mechanic',
    true
  ),
  (
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    null,
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    'วิชัย',
    'ยอดขาย',
    'wichai.agent@carrental.local',
    '082-345-6789',
    'rental_agent',
    true
  )
on conflict (id) do nothing;

insert into public.customers (
  id,
  first_name,
  last_name,
  email,
  phone,
  driver_license_no,
  driver_license_expiry,
  date_of_birth
)
values
  (
    '2c88a934-5f3d-4c3f-b228-bd1d6400ed1d',
    'สมชาย',
    'ใจดี',
    'somchai.jaidee@example.com',
    '081-222-3344',
    'TH1234567890123',
    '2027-06-30',
    '1988-05-12'
  ),
  (
    '7d78c1ab-39f9-43de-848d-95528caed040',
    'ณัฐกานต์',
    'โสภาพร',
    'nattakan.sopaporn@example.com',
    '089-555-6677',
    'TH9876543210987',
    '2028-11-15',
    '1992-09-08'
  ),
  (
    '0c7677bb-6f1b-4080-853c-bc38101dd1a1',
    'พิชญ์',
    'อัครเดช',
    'pitch.akardet@example.com',
    '062-123-7890',
    'TH5678901234567',
    '2026-03-20',
    '1990-01-25'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'วิภาดา',
    'จันทร์เพ็ญ',
    'wipada.c@example.com',
    '095-789-4561',
    'TH9991234567890',
    '2028-12-31',
    '1995-08-15'
  ),
  (
    'b9a4d4e3-9c7f-4b4a-b5d7-e5c9b3a1d2e8',
    'ธนกฤต',
    'พงศ์ไพบูลย์',
    'thanakrit.p@example.com',
    '083-456-7890',
    'TH8881234567890',
    '2027-09-30',
    '1987-03-20'
  ),
  (
    'c5d6e7f8-9a0b-1c2d-3e4f-5g6h7i8j9k0l',
    'กมลชนก',
    'วิศวกิจ',
    'kamonchanok.w@example.com',
    '097-123-4567',
    'TH7771234567890',
    '2026-11-15',
    '1993-12-05'
  )
on conflict (id) do nothing;

insert into public.vehicle_categories (
  id,
  name,
  description,
  daily_rate,
  weekly_rate,
  monthly_rate,
  required_deposit
)
values
  ('2e0f908f-d37b-4f44-8525-4ce7c3a9df43', 'Compact', 'รถขนาดเล็ก เหมาะกับในเมือง', 900, 5600, 18900, 3000),
  ('7f4f5a69-9e83-4f60-b9df-2d3533f1b6a8', 'Sedan', 'รถเก๋ง 4 ประตู นั่งสบาย', 1200, 7500, 24500, 5000),
  ('bb96f35b-4c5a-4fee-840b-4cb3cc8cbee3', 'SUV', 'รถเอนกประสงค์ 7 ที่นั่ง', 1800, 11200, 36800, 7000),
  ('a6e8287c-94ca-4e81-9077-32766e0a1acb', 'Pickup', 'กระบะตอนครึ่ง/4 ประตู บรรทุกได้', 1600, 9800, 32500, 6000),
  ('5f5b84f5-7ef3-4457-9d07-0d73ad725a4a', 'Electric', 'รถไฟฟ้า 5 ที่นั่ง พร้อมชาร์จ', 2000, 12400, 41000, 8000)
on conflict (id) do nothing;

insert into public.cars (
  id,
  category_id,
  branch_id,
  registration_no,
  vin,
  make,
  model,
  year,
  color,
  mileage,
  status
)
values
  (
    '3fcf5416-6bc4-4d1c-b703-44ea9e27c00f',
    '2e0f908f-d37b-4f44-8525-4ce7c3a9df43',
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    '8กข 1234',
    'VN1ABC12345678901',
    'Toyota',
    'Yaris',
    2022,
    'สีแดง',
    14500,
    'available'
  ),
  (
    '4f7e7ed6-5e57-4f7a-8152-20561ca9007c',
    '7f4f5a69-9e83-4f60-b9df-2d3533f1b6a8',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    '1ขจ 5678',
    'VN1ABC22345678901',
    'Honda',
    'Accord',
    2021,
    'สีดำ',
    38200,
    'reserved'
  ),
  (
    'f2d5142f-033e-4bb7-8215-5ed01f3814d8',
    'bb96f35b-4c5a-4fee-840b-4cb3cc8cbee3',
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    '7ฆธ 9012',
    'VN1ABC32345678901',
    'Mazda',
    'CX-8',
    2023,
    'สีขาว',
    8200,
    'rented'
  ),
  (
    'b2e669dc-76e1-4b37-86cb-5ca1c2fca256',
    'a6e8287c-94ca-4e81-9077-32766e0a1acb',
    '6a1c93fd-6cf8-4e8d-9c5b-7525302894f1',
    'ผก 3456',
    'VN1ABC42345678901',
    'Isuzu',
    'D-MAX',
    2020,
    'สีบรอนซ์เงิน',
    65500,
    'maintenance'
  ),
  (
    'b0d8a9d6-3dd2-4944-a17a-a9c12c1cdd89',
    '5f5b84f5-7ef3-4457-9d07-0d73ad725a4a',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    '9ธบ 7890',
    'VN1ABC52345678901',
    'BYD',
    'Atto 3',
    2024,
    'สีน้ำเงิน',
    2100,
    'available'
  )
on conflict (id) do nothing;

insert into public.maintenance_records (
  id,
  car_id,
  maintenance_date,
  odometer,
  maintenance_type,
  cost,
  performed_by,
  description
)
values
  (
    '30f88f24-0dc9-4bbf-8554-2427e351ed69',
    'b2e669dc-76e1-4b37-86cb-5ca1c2fca256',
    '2025-09-20',
    65000,
    'repair',
    5800,
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a',
    'ซ่อมช่วงล่างและเปลี่ยนผ้าเบรก'
  ),
  (
    '71d8c8f0-7d04-4b3d-9b7e-44c44c62a8eb',
    'b2e669dc-76e1-4b37-86cb-5ca1c2fca256',
    '2025-10-12',
    65250,
    'inspection',
    2200,
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a',
    'ตรวจสอบระบบไฟฟ้าและเปลี่ยนน้ำมันเครื่อง'
  ),
  (
    '0db9b810-0675-4f43-9a7a-624cc8e62727',
    '3fcf5416-6bc4-4d1c-b703-44ea9e27c00f',
    '2025-10-01',
    14000,
    'scheduled',
    1200,
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a',
    'เช็กระยะ 20,000 กม. และเปลี่ยนกรองอากาศ'
  ),
  (
    '5d132e18-05f6-47c5-bc46-596d65ac8ac2',
    'b0d8a9d6-3dd2-4944-a17a-a9c12c1cdd89',
    '2025-10-10',
    2000,
    'inspection',
    0,
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a',
    'ตรวจสอบระบบไฟฟ้าก่อนปล่อยเช่า'
  )
on conflict (id) do nothing;

insert into public.rental_contracts (
  id,
  contract_no,
  customer_id,
  car_id,
  pickup_branch_id,
  return_branch_id,
  employee_id,
  pickup_datetime,
  return_datetime,
  actual_return_datetime,
  rental_status,
  daily_rate,
  discount,
  late_fee,
  notes
)
values
  (
    'c1e9f019-5f87-4a59-bc9d-bf0d889432a1',
    'CR-2025-0001',
    '2c88a934-5f3d-4c3f-b228-bd1d6400ed1d',
    'f2d5142f-033e-4bb7-8215-5ed01f3814d8',
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    '2025-10-10 09:00:00+07',
    '2025-10-14 18:00:00+07',
    null,
    'active',
    1800,
    0,
    0,
    'ลูกค้าต้องการคาร์ซีทเด็ก เพิ่มในบันทึกตรวจรถ'
  ),
  (
    'd0d87b6e-0e72-41d3-9f28-c5f94117bb50',
    'CR-2025-0002',
    '7d78c1ab-39f9-43de-848d-95528caed040',
    '4f7e7ed6-5e57-4f7a-8152-20561ca9007c',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    'd016f6ab-7e24-49bb-8060-6f36d2cb8c3f',
    '2025-10-20 10:00:00+07',
    '2025-10-24 12:00:00+07',
    null,
    'pending',
    1200,
    0,
    0,
    'ลูกค้าจองเที่ยวต่างจังหวัด แจ้งตรวจสภาพยางก่อนส่งมอบ'
  ),
  (
    'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0',
    'CR-2025-0003',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'b0d8a9d6-3dd2-4944-a17a-a9c12c1cdd89',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    '2025-10-25 10:00:00+07',
    '2025-11-01 10:00:00+07',
    null,
    'pending',
    2000,
    200,
    0,
    'จองรถไฟฟ้าสำหรับทริปเที่ยวเขาใหญ่ ขอประกันภัยเพิ่มเติม'
  ),
  (
    'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6',
    'CR-2025-0004',
    'b9a4d4e3-9c7f-4b4a-b5d7-e5c9b3a1d2e8',
    'b2e669dc-76e1-4b37-86cb-5ca1c2fca256',
    '6a1c93fd-6cf8-4e8d-9c5b-7525302894f1',
    '6a1c93fd-6cf8-4e8d-9c5b-7525302894f1',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    '2025-09-15 08:00:00+07',
    '2025-09-18 17:00:00+07',
    '2025-09-18 16:30:00+07',
    'completed',
    1600,
    0,
    0,
    'เช่ากระบะขนของย้ายบ้าน คืนรถก่อนเวลา'
  ),
  (
    'k7l8m9n0-p1q2-r3s4-t5u6-v7w8x9y0z1a2',
    'CR-2025-0005',
    'c5d6e7f8-9a0b-1c2d-3e4f-5g6h7i8j9k0l',
    '3fcf5416-6bc4-4d1c-b703-44ea9e27c00f',
    'b45ad0b8-5624-4d5e-8b7f-3f7d74b5e401',
    '30b6e6b3-9957-4dec-9110-1a227af18d1d',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    '2025-10-01 09:00:00+07',
    '2025-10-31 09:00:00+07',
    null,
    'active',
    900,
    900,
    0,
    'เช่าเหมาเดือน ส่วนลดพิเศษ 1 วัน'
  )
on conflict (id) do nothing;

insert into public.payments (
  id,
  rental_id,
  payment_date,
  payment_method,
  amount,
  payment_type,
  reference_no,
  received_by,
  notes
)
values
  (
    'e8d88fa4-2ab6-4b0e-98ff-0cd113235ee8',
    'c1e9f019-5f87-4a59-bc9d-bf0d889432a1',
    '2025-10-05 11:00:00+07',
    'bank_transfer',
    5000,
    'deposit',
    'TXN-DEP-0001',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    'มัดจำก่อนรับรถ'
  ),
  (
    'bd82d672-8d3f-4b6e-a6a4-9f0e6a46c0da',
    'c1e9f019-5f87-4a59-bc9d-bf0d889432a1',
    '2025-10-10 09:30:00+07',
    'credit_card',
    7200,
    'rental_fee',
    'TXN-RF-0001',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    'เก็บค่าเช่า 4 วัน'
  ),
  (
    '5d68cf61-d90d-4ffd-bb76-2cac0a6fc508',
    'd0d87b6e-0e72-41d3-9f28-c5f94117bb50',
    '2025-10-15 14:10:00+07',
    'bank_transfer',
    3000,
    'deposit',
    'TXN-DEP-0002',
    'd016f6ab-7e24-49bb-8060-6f36d2cb8c3f',
    'มัดจำก่อนรับรถ 5 วันล่วงหน้า'
  ),
  (
    'b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8',
    'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0',
    '2025-10-20 15:30:00+07',
    'credit_card',
    8000,
    'deposit',
    'TXN-DEP-0003',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    'มัดจำรถไฟฟ้า และค่าประกันภัยเพิ่มเติม'
  ),
  (
    'r9s0t1u2-v3w4-x5y6-z7a8-b9c0d1e2f3g4',
    'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6',
    '2025-09-15 08:30:00+07',
    'bank_transfer',
    4800,
    'rental_fee',
    'TXN-RF-0003',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    'ค่าเช่า 3 วัน'
  ),
  (
    'h5i6j7k8-l9m0-n1o2-p3q4-r5s6t7u8v9w0',
    'k7l8m9n0-p1q2-r3s4-t5u6-v7w8x9y0z1a2',
    '2025-09-30 14:20:00+07',
    'bank_transfer',
    3000,
    'deposit',
    'TXN-DEP-0004',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    'มัดจำรถเช่าเหมาเดือน'
  ),
  (
    'x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6',
    'k7l8m9n0-p1q2-r3s4-t5u6-v7w8x9y0z1a2',
    '2025-10-01 09:15:00+07',
    'credit_card',
    26100,
    'rental_fee',
    'TXN-RF-0004',
    'b7117a76-5d5e-4f76-9f87-4d64d6c87f6c',
    'ค่าเช่า 30 วัน หักส่วนลด 1 วัน'
  )
on conflict (id) do nothing;

insert into public.rental_inspections (
  id,
  rental_id,
  inspection_type,
  inspection_datetime,
  odometer,
  fuel_level_percent,
  damages,
  notes,
  inspected_by
)
values
  (
    'f0b3d41f-1c58-4eae-8f8c-6f46a3cbca8d',
    'c1e9f019-5f87-4a59-bc9d-bf0d889432a1',
    'pickup',
    '2025-10-10 09:15:00+07',
    8205,
    90,
    '[]',
    'ถ่ายรูปตัวถังรอบคัน ไม่มีรอยเพิ่มเติม ติดตั้งคาร์ซีทเรียบร้อย',
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a'
  ),
  (
    'n7o8p9q0-r1s2-t3u4-v5w6-x7y8z9a0b1c2',
    'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6',
    'pickup',
    '2025-09-15 08:45:00+07',
    65500,
    100,
    '[]',
    'ตรวจสอบสภาพกระบะและพื้นที่บรรทุก ไม่พบความเสียหาย',
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a'
  ),
  (
    'd3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8',
    'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6',
    'return',
    '2025-09-18 16:30:00+07',
    65800,
    85,
    '[]',
    'สภาพรถปกติ เติมน้ำมันก่อนคืน',
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a'
  ),
  (
    't9u0v1w2-x3y4-z5a6-b7c8-d9e0f1g2h3i4',
    'k7l8m9n0-p1q2-r3s4-t5u6-v7w8x9y0z1a2',
    'pickup',
    '2025-10-01 09:00:00+07',
    14500,
    100,
    '[]',
    'รถเช่าระยะยาว ตรวจเช็คสภาพทั่วไปละเอียด มีการนัดตรวจสภาพกลางเดือน',
    'a9f1ce88-6dc9-49cc-9bef-97845d5df85a'
  )
on conflict (id) do nothing;

commit;
