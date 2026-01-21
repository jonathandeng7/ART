import type { Metadata } from "next";
import { Libre_Baskerville, Marcellus } from "next/font/google";
import "./globals.css";

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baskerville",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-marcellus",
});

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
      <body
        className={`${baskerville.variable} ${marcellus.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
