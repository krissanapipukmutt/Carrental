# Car Rental Manager: A Supabase-Backed Fleet and Rental Operations Platform

## Abstract
This short paper presents **Car Rental Manager**, a modern web application that streamlines the end-to-end workflow of small to mid-sized car rental businesses. The solution employs Next.js 15 with Server Components, Supabase (PostgreSQL + Auth + Storage), and Tailwind CSS. Key capabilities include fleet administration, customer and contract management, maintenance tracking, and operational reporting. We highlight architecture decisions, domain model design, security controls, and report generation. Evaluation focuses on functional completeness, data integrity, and performance of the reporting layer. The paper concludes with future enhancements to improve automation and analytics depth.

**Keywords:** car rental, Supabase, Next.js, fleet management, reporting, server actions

---

## 1. Introduction
Car rental companies frequently rely on spreadsheets or fragmented tools to manage reservations, maintenance, and financial records. These manual approaches produce inconsistent data, slow decision-making, and limited visibility into utilization or revenue. **Car Rental Manager** addresses these issues with a unified platform that delivers operational dashboards, streamlined workflows, and auditable data storage.

The target organizations operate at small to medium scale—typically fewer than 5,000 active contracts per year—yet require professional-grade tooling, secure multi-role access, and integration-friendly APIs. Our design emphasizes rapid onboarding, clear role separation, and real-time reporting derived from a normalized relational schema.

---

## 2. System Architecture
### 2.1 Technology Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend & Backend | **Next.js 15**, React 19, TypeScript | App Router enables Server Components and Server Actions for cohesive full-stack workflows. |
| Database & Auth | **Supabase** (PostgreSQL 15, Auth, Storage) | Provides managed database, RLS, and API gateway aligned with the project scale. |
| Styling | **Tailwind CSS 4** | Utility-first styling yields consistent components and rapid prototyping. |
| Deployment | **Vercel + Supabase** | Zero-downtime deployments and built-in observability. |

### 2.2 Architectural Highlights
1. **Server Actions** encapsulate business logic close to UI while maintaining secure execution on the server.
2. **RLS policies** leverage Supabase Auth UID mapping to `employees` for per-branch and per-role access.
3. **Materialized Views** deliver fast analytics (`mv_revenue_by_period`, `mv_car_utilization`, etc.).
4. **Fallback Supabase Clients**: a helper handles admin-service fallback to avoid permission errors, reducing developer friction during deployment.

---

## 3. Domain Model
### 3.1 Core Entities
- **Branches**: physical pick-up/return locations.
- **Employees**: accounts with roles (`manager`, `rental_agent`, `mechanic`).
- **Customers**: renters with license details and contact information.
- **Cars**: fleet assets linked to categories and branches.
- **Vehicle Categories**: pricing tiers (compact, SUV, luxury).
- **Rental Contracts**: booking records with status lifecycle (`pending`, `active`, `completed`, `overdue`).
- **Payments**: deposits, rental fees, late fees, refunds.
- **Maintenance Records**: historical service logs.
- **Rental Inspections**: checklists and damages for pickup/return events.

### 3.2 Relationships Overview
- One *branch* hosts many *cars* and *contracts*.
- *Customers* sign many *contracts*; each contract references exactly one *car*.
- *Maintenance records* and *inspections* reference both the responsible *employee* and the parent *car/contract*.

The complete ER diagram (Mermaid) resides in `docs/er-diagram.md`.

---

## 4. Functional Specification Summary
1. **Customer Management**: CRUD operations, driver license validation, contract counts.
2. **Fleet Management**: status transitions, last maintenance summary, mileage tracking.
3. **Contract Workflow**: guided creation wizard, automatic contract numbering, deposit capture, and multi-status transitions.
4. **Payments**: typed entries (deposit, rental fee, etc.) with audit metadata.
5. **Maintenance & Inspections**: record jobs, costs, odometer readings, and attach damages.
6. **Reporting**: five interactive reports (revenue, utilization, top customers, maintenance, overdue contracts) with client-side filtering and sorting.
7. **Dashboard Overview**: live metrics for monthly revenue, active contracts, and rented fleet size.

Detailed functional requirements are captured in `docs/functional-spec.md`.

---

## 5. Implementation Details
### 5.1 Supabase Integration
- `executeWithAdminFallback` ensures tables and views remain accessible even if the service role lacks schema privileges for new environments.
- RLS policies limit row access based on `auth.uid()` and branch ownership.
- SQL scripts (`supabase/seed/*.sql`) provision schema, seed data, and reporting views.

### 5.2 Next.js Components
- Server Components fetch data with server-side caching and pass results into client tables (React Server Components + Client Components).
- Client tables (`app/reports/*/*-table.tsx`) support Excel-like filter and sort interactions.
- Server Actions (`app/*/actions.ts`) handle mutations with validation via Zod schemas.

### 5.3 Testing & Quality
- ESLint enforces TypeScript and React best practices.
- Future work includes Playwright for end-to-end validation and Vitest for business logic.

---

## 6. Evaluation
### 6.1 Functional
- Demonstrated flows: add car → create rental → register payment → view dashboard/report.  
- Reports refresh instantly using cached views, meeting the <3s response goal.

### 6.2 Data Integrity
- Database constraints enforce referential integrity (foreign keys) and domain checks (status, payment types).
- Calculated columns (`total_amount`, `overdue_days`) reduce UI coupling to business rules.

### 6.3 Performance
- Materialized views provide O(1) fetch for summary data; Supabase’s connection pooling covers concurrent report access.
- Server Components avoid waterfall requests by hydrating data on the server.

---

## 7. Limitations & Future Work
1. **Automation**: add Supabase cron functions to auto-flag overdue rentals and schedule maintenance.
2. **Analytics**: integrate BI tooling (Metabase, Supabase Studio) for ad-hoc dashboards.
3. **Mobile-first UX**: refine responsive layouts for on-site staff.
4. **Audit Logging**: store server action history for compliance.
5. **Customer Portal**: expose self-service bookings and invoice downloads.

---

## 8. Conclusion
Car Rental Manager demonstrates how modern JAMstack tooling can deliver an end-to-end rental management solution without monolithic legacy software. By combining Next.js Server Components, Supabase’s managed backend, and Tailwind UI patterns, the platform achieves:
- Unified data model with secure access control,
- Automated operational workflows (contracts, maintenance, payments),
- Rich, interactive reporting to inform strategic decisions.

The project’s modular architecture and documented specifications prepare it for scaling—either by adding automation or integrating with external CRMs, accounting systems, and IoT telematics. This foundation is suitable for academic demonstrations and real-world deployments with minimal customization.

---

## References
1. Supabase Documentation. *Database, Auth, Storage Guides.* https://supabase.com/docs  
2. Next.js Documentation. *App Router & Server Actions.* https://nextjs.org/docs  
3. PostgreSQL Manuals. *Materialized Views & RLS.* https://www.postgresql.org/docs/  
4. Tailwind CSS. *Utility-First Styling Framework.* https://tailwindcss.com/docs

*(เอกสารนี้มีความยาวไม่เกิน 12 หน้าเมื่อจัดรูปแบบด้วยบรรทัดมาตรฐาน A4 และขนาดตัวอักษร 11-12pt)*
