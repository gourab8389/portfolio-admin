import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/shared/provider";
import { Providers } from "@/components/layout/providers";
import { fontVariables } from "@/lib/font";

export const metadata: Metadata = {
  title: "Portfolio Admin",
  description: "A polished admin workspace for managing your portfolio content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} font-sans antialiased`}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
