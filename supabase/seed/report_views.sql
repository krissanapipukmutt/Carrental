BEGIN;

-- เตรียมสคีมา/เส้นทาง
CREATE SCHEMA IF NOT EXISTS car_rental;
SET search_path TO car_rental;

-- ---------- ฟังก์ชันช่วย: ดรอปชื่อใด ๆ ที่อาจเป็น VIEW หรือ MATERIALIZED VIEW ----------
DO $$
DECLARE v_name text;
BEGIN
  FOREACH v_name IN ARRAY ARRAY[
    'mv_car_utilization',
    'mv_top_customers',
    'mv_maintenance_history',
    'mv_overdue_rentals'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_matviews
      WHERE schemaname='car_rental' AND matviewname=v_name
    ) THEN
      EXECUTE format('DROP MATERIALIZED VIEW car_rental.%I;', v_name);
    ELSIF EXISTS (
      SELECT 1 FROM pg_views
      WHERE schemaname='car_rental' AND viewname=v_name
    ) THEN
      EXECUTE format('DROP VIEW car_rental.%I;', v_name);
    END IF;
  END LOOP;
END $$;

-- ---------- ดรอป/สร้าง MATERIALIZED VIEW รายได้รายเดือน ----------
DROP MATERIALIZED VIEW IF EXISTS car_rental.mv_revenue_by_period;
CREATE MATERIALIZED VIEW car_rental.mv_revenue_by_period AS
SELECT
  date_trunc('month', payment_date) AS period,
  SUM(CASE WHEN payment_type = 'rental_fee' THEN amount ELSE 0 END) AS rental_income,
  SUM(CASE WHEN payment_type = 'late_fee'  THEN amount ELSE 0 END) AS late_fee_income,
  SUM(CASE WHEN payment_type = 'deposit'   THEN amount ELSE 0 END) AS deposits,
  SUM(CASE WHEN payment_type = 'refund'    THEN amount ELSE 0 END) AS refunds,
  SUM(amount) AS total_income
FROM car_rental.payments
GROUP BY 1;

-- ดัชนี (ให้ REFRESH CONCURRENTLY ได้และช่วย query)
CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_revenue_by_period_period
ON car_rental.mv_revenue_by_period (period);

-- ---------- สร้าง VIEW ต่าง ๆ ----------
-- อัตราใช้งานรถ (90 วันย้อนหลัง)
CREATE OR REPLACE VIEW car_rental.mv_car_utilization AS
WITH rental_days AS (
  SELECT
    car_id,
    SUM(
      GREATEST(
        0,
        CEIL(
          EXTRACT(
            EPOCH FROM
              LEAST(COALESCE(actual_return_datetime, return_datetime), now())
              - GREATEST(pickup_datetime, now() - INTERVAL '90 days')
          ) / 86400
        )
      )
    )::int AS rented_days
  FROM car_rental.rental_contracts
  WHERE pickup_datetime >= now() - INTERVAL '90 days'
  GROUP BY 1
)
SELECT
  c.id AS car_id,
  c.registration_no,
  c.make,
  c.model,
  COALESCE(rental_days.rented_days, 0) AS rented_days,
  90 AS period_days,
  ROUND((COALESCE(rental_days.rented_days, 0)::numeric / 90) * 100, 2) AS utilization_percent
FROM car_rental.cars c
LEFT JOIN rental_days ON rental_days.car_id = c.id;

-- ลูกค้าท็อป
CREATE OR REPLACE VIEW car_rental.mv_top_customers AS
SELECT
  rc.customer_id,
  COUNT(rc.id)          AS rental_count,
  SUM(rc.total_amount)  AS total_spent,
  MIN(rc.pickup_datetime) AS first_rental,
  MAX(rc.return_datetime) AS last_rental
FROM car_rental.rental_contracts rc
GROUP BY rc.customer_id
ORDER BY rental_count DESC;

-- ประวัติซ่อมบำรุง
CREATE OR REPLACE VIEW car_rental.mv_maintenance_history AS
SELECT
  car_id,
  COUNT(*)  AS total_jobs,
  SUM(cost) AS total_cost,
  MAX(maintenance_date) AS last_service_date
FROM car_rental.maintenance_records
GROUP BY car_id;

-- สัญญาคืนเกินกำหนด
CREATE OR REPLACE VIEW car_rental.mv_overdue_rentals AS
SELECT
  rc.id AS rental_id,
  rc.contract_no,
  rc.customer_id,
  rc.car_id,
  rc.return_datetime,
  now() AS current_time,
  EXTRACT(day FROM now() - rc.return_datetime)::int AS overdue_days,
  rc.late_fee
FROM car_rental.rental_contracts rc
WHERE rc.rental_status = 'overdue'
ORDER BY overdue_days DESC;

-- ---------- GRANT อ่าน ----------
GRANT SELECT ON
  car_rental.mv_revenue_by_period,
  car_rental.mv_car_utilization,
  car_rental.mv_top_customers,
  car_rental.mv_maintenance_history,
  car_rental.mv_overdue_rentals
TO anon, authenticated;

COMMIT;
