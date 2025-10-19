# ER Diagram – Car Rental Manager

> แผนภาพนี้สรุปความสัมพันธ์หลักของสคีมา `car_rental` ใน Supabase โดยใช้สัญลักษณ์ Mermaid ER Diagram  
> หมายเหตุ: ปรับเปลี่ยนได้ตาม requirement จริงในระหว่างการพัฒนา

```mermaid
erDiagram
  BRANCHES ||--o{ EMPLOYEES : "ประจำสาขา"
  BRANCHES ||--o{ CARS : "จอดอยู่ที่"
  BRANCHES ||--o{ RENTAL_CONTRACTS : "จุดรับ/คืน"

  VEHICLE_CATEGORIES ||--o{ CARS : "จัดอยู่ใน"

  EMPLOYEES ||--o{ PAYMENTS : "รับชำระ"
  EMPLOYEES ||--o{ MAINTENANCE_RECORDS : "ปฏิบัติงาน"
  EMPLOYEES ||--o{ RENTAL_INSPECTIONS : "ตรวจสภาพ"

  CUSTOMERS ||--o{ RENTAL_CONTRACTS : "ลงนาม"
  CUSTOMERS ||--o{ PAYMENTS : "ชำระ/รับคืน"

  CARS ||--o{ RENTAL_CONTRACTS : "ถูกเช่าใน"
  CARS ||--o{ MAINTENANCE_RECORDS : "มีประวัติซ่อม"

  RENTAL_CONTRACTS ||--o{ PAYMENTS : "มีการชำระ"
  RENTAL_CONTRACTS ||--o{ RENTAL_INSPECTIONS : "ตรวจสภาพ"

  RENTAL_CONTRACTS {
    uuid id PK
    uuid customer_id FK
    uuid car_id FK
    uuid pickup_branch_id FK
    uuid return_branch_id FK
    timestamptz pickup_datetime
    timestamptz return_datetime
    text rental_status
    numeric daily_rate
    numeric discount
    numeric deposit_amount
  }

  CARS {
    uuid id PK
    text make
    text model
    int year
    text status
    int mileage
    uuid branch_id FK
    uuid category_id FK
  }

  CUSTOMERS {
    uuid id PK
    text first_name
    text last_name
    text email
    text phone
    text driver_license_no
    date driver_license_expiry
  }

  PAYMENTS {
    uuid id PK
    uuid rental_id FK
    timestamptz payment_date
    text payment_method
    numeric amount
    text payment_type
    uuid received_by FK
  }

  MAINTENANCE_RECORDS {
    uuid id PK
    uuid car_id FK
    date maintenance_date
    text maintenance_type
    int odometer
    numeric cost
    uuid performed_by FK
  }

  RENTAL_INSPECTIONS {
    uuid id PK
    uuid rental_id FK
    text inspection_type
    timestamptz inspection_datetime
    int odometer
    int fuel_level_percent
    jsonb damages
  }
```

## การใช้งาน
- สามารถคัดลอกโค้ด Mermaid ไปวางใน Markdown viewer ที่รองรับ (เช่น VS Code, Obsidian, GitLab/GitHub ที่เปิดใช้ Mermaid) เพื่อดูผังความสัมพันธ์
- หากต้องการไฟล์รูปภาพ ให้ใช้ Mermaid CLI หรือ https://mermaid.live แปลงเป็น PNG/SVG

---
> ERD ฉบับนี้จัดทำเพื่อประกอบเอกสารสถาปัตยกรรมและช่วยทีม dev/analyst เข้าใจโครงสร้างข้อมูลหลัก
