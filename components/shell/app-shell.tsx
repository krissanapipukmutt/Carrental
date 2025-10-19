import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "แดชบอร์ด" },
  { href: "/rentals", label: "สัญญาเช่า" },
  { href: "/cars", label: "รถ" },
  { href: "/customers", label: "ลูกค้า" },
  { href: "/reports", label: "รายงาน" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase text-slate-500 tracking-wide">
              Car Rental Manager
            </p>
            <h1 className="text-xl font-semibold">ระบบจัดการเช่ารถ</h1>
          </div>
          <div className="text-sm text-slate-500">
            เวอร์ชันต้นแบบสำหรับ Short Paper
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-56 flex-shrink-0 flex-col gap-2 text-sm text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-medium transition hover:bg-slate-200 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
