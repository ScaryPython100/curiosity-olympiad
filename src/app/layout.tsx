import "./globals.css"; // This import is what hooks up Tailwind!
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "sonner";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Curiosity Olympiad",
  description: "Your journey to discovery begins here.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden max-w-[100vw]">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Montserrat & Material Symbols injection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" 
        />
      </head>
      <body suppressHydrationWarning className="bg-[#f7f9fb] dark:bg-gray-900 text-[#191c1e] dark:text-gray-100 antialiased transition-colors duration-300 overflow-x-hidden w-full max-w-[100vw]">
        <ThemeInitializer />
        <LanguageProvider>
          {children}
          <Toaster position="top-center" richColors theme="system" />
        </LanguageProvider>
      </body>
    </html>
  );
}