import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Personal mission control dashboard for AI agent orchestration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="ml-56 min-h-screen flex flex-col relative">
          <TopBar />
          <div className="flex-1 p-6 z-0">
            {children}
          </div>
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </body>
    </html>
  );
}
