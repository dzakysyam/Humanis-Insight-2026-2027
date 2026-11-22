import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Humanis Insight - SMK Tiara Nusa',
    template: '%s - Humanis Insight',
  },
  description:
    'Platform manajemen sekolah internal SMK Tiara Nusa. Dashboard Kepala Sekolah sebagai pusat monitoring modul.',
  robots: {
    // Aplikasi internal tidak boleh diindeks mesin pencari.
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
