import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { AuthShell } from '@/components/AuthShell';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KBC Trip — Platform Ops',
  description: 'Marketplace operations console for KBC Trip.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <AuthProvider>
          <ToastProvider>
            <AuthShell>{children}</AuthShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
