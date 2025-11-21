import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RecipeProvider } from "@/context/RecipeContext";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RecipeProvider>
          {children}
        </RecipeProvider>
      </body>
    </html>
  );
}
