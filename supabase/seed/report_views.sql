-- สร้าง View สำหรับรายงานต่าง ๆ
-- รันสคริปต์นี้ใน Supabase SQL editor หรือผ่าน CLI หลังจากสร้างตารางหลักแล้ว

create or replace view public.mv_revenue_by_period as
select
  date_trunc('month', payment_date) as period,
  sum(case when payment_type = 'rental_fee' then amount else 0 end) as rental_income,
  sum(case when payment_type = 'late_fee' then amount else 0 end) as late_fee_income,
  sum(case when payment_type = 'deposit' then amount else 0 end) as deposits,
  sum(case when payment_type = 'refund' then amount else 0 end) as refunds,
  sum(amount) as total_income
from public.payments
group by 1
order by 1 desc;

create or replace view public.mv_car_utilization as
with rental_days as (
  select
    car_id,
    sum(
      greatest(
        0,
        ceil(
          extract(
            epoch from
              least(coalesce(actual_return_datetime, return_datetime), now())
              - greatest(pickup_datetime, now() - interval '90 days')
          ) / 86400
        )
      )
    )::int as rented_days
  from public.rental_contracts
  where pickup_datetime >= now() - interval '90 days'
  group by 1
)
select
  c.id as car_id,
  c.registration_no,
  c.make,
  c.model,
  coalesce(rental_days.rented_days, 0) as rented_days,
  90 as period_days,
  round((coalesce(rental_days.rented_days, 0)::numeric / 90) * 100, 2) as utilization_percent
from public.cars c
left join rental_days on rental_days.car_id = c.id;

create or replace view public.mv_top_customers as
select
  rc.customer_id,
  count(rc.id) as rental_count,
  sum(rc.total_amount) as total_spent,
  min(rc.pickup_datetime) as first_rental,
  max(rc.return_datetime) as last_rental
from public.rental_contracts rc
group by rc.customer_id
order by rental_count desc;

create or replace view public.mv_maintenance_history as
select
  car_id,
  count(*) as total_jobs,
  sum(cost) as total_cost,
  max(maintenance_date) as last_service_date
from public.maintenance_records
group by car_id;

create or replace view public.mv_overdue_rentals as
select
  rc.id as rental_id,
  rc.contract_no,
  rc.customer_id,
  rc.car_id,
  rc.return_datetime,
  now() as current_time,
  extract(day from now() - rc.return_datetime)::int as overdue_days,
  rc.late_fee
from public.rental_contracts rc
where rc.rental_status = 'overdue'
order by overdue_days desc;
