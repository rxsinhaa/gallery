import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
});

export const metadata: Metadata = {
  title: "Gift Her A Website - Photo Gallery",
  description: "A beautiful photo collection for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bungee.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
