import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
});

export const metadata: Metadata = {
  title: "Car Rental Manager",
  description:
    "ระบบจัดการเช่ารถสำหรับงาน Short Paper นักศึกษาปริญญาโท ครอบคลุมสัญญาเช่า รถ ลูกค้า และรายงาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoThai.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
