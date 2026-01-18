import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art Beyond Sight",
  description:
    "AI-powered accessibility platform for analyzing artwork, monuments, and landscapes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
