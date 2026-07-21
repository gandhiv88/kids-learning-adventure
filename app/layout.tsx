import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Adventure",
  description: "A playful local math adventure for young learners.",
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
