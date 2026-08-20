import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Family Shopping List",
  description: "Shared shopping list for families",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>

      <body>
        <div className="app-wrapper w-full max-w-2xl mx-auto px-3">

          {children}
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/service-worker.js");
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
