import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Energy Monitor",
  description: "IoT energy monitoring dashboard powered by MQTT over WebSocket.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
