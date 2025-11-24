import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { env } from "@/config/env";
import "./globals.css";
import "antd/dist/reset.css";

// Get API URL for CSP
const getApiUrlForCSP = () => {
  const apiUrl = env.apiUrl || "http://localhost:8080";
  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:8080";
  }
};

// Get WebSocket URLs for CSP (ws:// and wss:// versions)
const getWebSocketUrlsForCSP = () => {
  const apiUrl = env.apiUrl || "http://localhost:8080";
  try {
    const url = new URL(apiUrl);
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${url.host} ws://${url.host} wss://${url.host}`;
  } catch {
    return "ws://localhost:8080 wss://localhost:8080";
  }
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orchard Admin Dashboard",
  description: "Administration panel for Orchard Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const apiUrlForCSP = getApiUrlForCSP();
  const wsUrlsForCSP = getWebSocketUrlsForCSP();
  // Include Turnstile domains in both dev and production (required for Turnstile to load)
  const turnstileDomains =
    "https://challenges.cloudflare.com https://*.cloudflare.com";

  const cspContent = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'${
      turnstileDomains ? ` ${turnstileDomains}` : ""
    }`,
    `style-src 'self' 'unsafe-inline'${
      turnstileDomains ? ` ${turnstileDomains}` : ""
    }`,
    `img-src 'self' data: blob: http://127.0.0.1:9000 http://localhost:9000${
      turnstileDomains ? ` ${turnstileDomains}` : ""
    }`,
    "font-src 'self' data:",
    `connect-src 'self'${
      turnstileDomains ? ` ${turnstileDomains}` : ""
    } https://localhost:3000 http://localhost:3000 ${apiUrlForCSP} ${wsUrlsForCSP}`,
    `frame-src 'self'${turnstileDomains ? ` ${turnstileDomains}` : ""}`,
  ]
    .filter((directive) => directive.trim() !== "")
    .join("; ");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Content Security Policy for Cloudflare Turnstile and Backend API */}
        {/* Note: frame-ancestors only works in HTTP headers, not in meta tags */}
        {/* Turnstile domains only included in production to reduce development warnings */}
        <meta httpEquiv="Content-Security-Policy" content={cspContent} />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
