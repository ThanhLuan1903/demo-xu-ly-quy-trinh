import type { Metadata } from "next";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});


export const metadata: Metadata = {
  title: "AI Office",
  icons: {
    icon: [
      {
        url: "/logo-dnc.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={beVietnam.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
