import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "../components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Thrift I/O",
  description: "Track your thrift finds, savings, and environmental impact.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Thrift I/O",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#333829",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets safe-area-inset-* env() vars resolve on iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
