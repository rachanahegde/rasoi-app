import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/context/AppProviders";
import DottedBackground from "@/components/DottedBackground";
import ToastContainer from "@/components/ToastContainer";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rasoi",
  description: "Your recipe notebook",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-dot-pattern text-foreground font-sans selection:bg-primary/20 selection:text-primary`}
      >
        <AppProviders>
          <DottedBackground />
          <ToastContainer />
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 md:ml-24 p-6 md:p-12 max-w-[1600px] mx-auto w-full pb-24 md:pb-10">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
