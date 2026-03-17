import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ma Communauté Podcasts",
  description: "Communauté privée de partage de podcasts",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
