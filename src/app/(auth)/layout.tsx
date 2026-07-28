import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | CoreOnyx',
  description: 'Login to access your CoreOnyx dashboard.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
