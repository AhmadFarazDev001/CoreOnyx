import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | CoreOnyx',
  description: 'Login to access your CoreOnyx dashboard.',
};

/**
 * Base layout for authentication routes.
 * Provides a clean, unencumbered canvas for login and onboarding flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
