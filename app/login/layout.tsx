import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - SkillStock',
  description: 'Sign in to SkillStock',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

