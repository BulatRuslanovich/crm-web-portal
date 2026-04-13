import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s · Pharmo CRM',
    default: 'Pharmo CRM — управление визитами',
  },
  description:
    'Pharmo CRM — платформа для медицинских представителей: планирование и проведение визитов к врачам и организациям, отчётность и аналитика.',
  applicationName: 'Pharmo CRM',
  keywords: [
    'Pharmo CRM',
    'фарма CRM',
    'медицинские представители',
    'визиты к врачам',
    'аптеки',
    'планирование визитов',
  ],
  authors: [{ name: 'Pharmo' }],
  creator: 'Pharmo',
  openGraph: {
    title: 'Pharmo CRM',
    description: 'Система управления визитами медицинских представителей',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Pharmo CRM',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://crm.pharmo.uz'),
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d9488' },
    { media: '(prefers-color-scheme: dark)', color: '#031416' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
