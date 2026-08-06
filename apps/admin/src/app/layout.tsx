import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'StartinDE Admin — Operations',
    template: '%s | StartinDE Admin',
  },
  description: 'StartinDE internal operations platform: knowledge review, cases, services.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
