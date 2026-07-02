import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thrift I/O",
  description: "Track your thrift finds, savings, and environmental impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
