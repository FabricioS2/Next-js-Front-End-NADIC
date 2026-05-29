import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simpósio Coral Vivo",
  description: "Evento científico sobre branqueamento de corais",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToastProvider>
          <Header />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}