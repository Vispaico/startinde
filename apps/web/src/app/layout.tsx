import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'StartinDE — Your verified personal path to Germany',
    template: '%s | StartinDE',
  },
  description:
    'StartinDE combines official German information, personalised AI guidance, document readiness tools, and qualified human support to help you study, work, train, and settle in Germany.',
  icons: {
    icon: '/icon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
