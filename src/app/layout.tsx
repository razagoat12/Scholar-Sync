import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScholarSync | Discover Your Perfect Scholarship',
  description: 'Find and apply to scholarships tailored to your dreams and ambitions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream">{children}</body>
    </html>
  );
}
