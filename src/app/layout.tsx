import { metadata, viewport } from "./metadata";
import Schema from "./Schema";
import "./globals.css";
import "./admin-motion.css";
import { InitialLoadProvider } from "@/providers/InitialLoadContext"; // Import the provider

export const dynamic = "force-dynamic";
export const revalidate = 0;

export { metadata, viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="relative" data-scroll-behavior="smooth" lang="en">
      <head>
        <Schema />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      </head>
      <body suppressHydrationWarning>
        <InitialLoadProvider>
          {children}
        </InitialLoadProvider>
      </body>
    </html>
  );
}
