import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { Metadata } from 'next';
import { StoreProvider } from './StoreProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | Next ERP',
    default: 'Next ERP',
  },
  description: 'Based on Next.js ERP system, built with App Router.',
  metadataBase: new URL('https://next-erp-tau.vercel.app/'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <div id="modal" />
          {children}
        </body>
      </html>
    </StoreProvider>
  );
}
