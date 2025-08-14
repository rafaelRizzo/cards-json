import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Cards Json",
  description: "Um ajudante para copiar e colar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors position="bottom-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
