import "./globals.css"; // This import is what hooks up Tailwind!
import { LanguageProvider } from "@/context/LanguageContext";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Montserrat & Material Symbols injection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[#f7f9fb] dark:bg-gray-900 text-[#191c1e] dark:text-gray-100 antialiased transition-colors duration-300">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}