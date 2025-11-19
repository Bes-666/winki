import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkillStock - Social Stock Market for Skills',
  description: 'Invest in skills, earn from progress',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto scrollbar-thin">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}


