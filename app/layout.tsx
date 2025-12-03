import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | нафиг ERP',
    default: 'нафиг ERP',
  },
  description: 'Based on Next.js light ERP system, built with Tailwind & Zustand.',
  metadataBase: new URL('https://next-erp-tau.vercel.app/'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div id="modal" />
        {children}
      </body>
    </html>
  );
}
