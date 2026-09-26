import "./globals.css"; // This import is what hooks up Tailwind!
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "sonner";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { TabSessionGuard } from "@/components/TabSessionGuard";
import { StreakExpiryAlert } from "@/components/StreakExpiryAlert";
import Script from "next/script";
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
        {/* Synchronous Tab-Close Session Guard to eliminate flash of deep-link UI */}
        <Script id="tab-session-guard" strategy="beforeInteractive">
          {`
            (function() {
              try {
                if (window.location.search.indexOf('review=true') !== -1) return;
                var isTabActive = sessionStorage.getItem('curiosity_tab_session_active');
                if (isTabActive) return;

                var pathname = window.location.pathname;
                var cookies = document.cookie || '';
                var hasAuth = cookies.indexOf('sb-') !== -1 || cookies.indexOf('descope_session') !== -1;
                
                if (!hasAuth) {
                  try {
                    for (var i = 0; i < localStorage.length; i++) {
                      var k = localStorage.key(i);
                      if (k && k.indexOf('sb-') !== -1 && k.indexOf('-auth-token') !== -1) {
                        hasAuth = true;
                        break;
                      }
                    }
                  } catch (e) {}
                }

                var protectedRoutes = [
                  '/dashboard',
                  '/leaderboard',
                  '/profile',
                  '/tournaments',
                  '/practice',
                  '/settings',
                  '/campus-map',
                  '/mock-h5p-content'
                ];

                var isProtected = protectedRoutes.some(function(r) {
                  return pathname === r || pathname.indexOf(r + '/') === 0;
                });

                if (hasAuth) {
                  sessionStorage.setItem('curiosity_tab_session_active', 'true');
                  sessionStorage.setItem('curiosity_tab_session_time', Date.now().toString());
                  if (pathname !== '/dashboard' && (isProtected || pathname === '/login')) {
                    window.location.replace('/dashboard');
                  }
                } else {
                  if (isProtected) {
                    window.location.replace('/login');
                  }
                }
              } catch (e) {}
            })();
          `}
        </Script>
        {/* Montserrat & Material Symbols injection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" 
        />
      </head>
      <body suppressHydrationWarning className="bg-[#f7f9fb] dark:bg-gray-900 text-[#191c1e] dark:text-gray-100 antialiased transition-colors duration-300 overflow-x-hidden w-full max-w-[100vw]">
        <TabSessionGuard />
        <StreakExpiryAlert />
        <ThemeInitializer />
        <LanguageProvider>
          {children}
          <Toaster position="top-center" richColors theme="system" />
        </LanguageProvider>
      </body>
    </html>
  );
}