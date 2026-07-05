import "./globals.css";

export const metadata = {
  title: "Curiosity Olympiad",
  description: "Phase 3 Architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-white text-black">
        {children}
      </body> 
    </html>
  );
}